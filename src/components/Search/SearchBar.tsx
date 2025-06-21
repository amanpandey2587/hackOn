import React, { useState, useCallback, useRef } from 'react';
import { Search, X, Globe, AlertCircle, Loader2, Film, Tv, Music, FileText, ExternalLink } from 'lucide-react';

const SearchBar = ({ 
  backendUrl = '',
  onResultsReceived = () => {},
  placeholder = "Search movies, TV shows, songs, documentaries...",
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const searchTimeoutRef = useRef(null);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' }
  ];

  // Updated function to use your backend API
  const searchWithGemini = async (searchTerm, language) => {
    const languageName = languages.find(l => l.code === language)?.name || 'English';
    
    try {
      const response = await fetch(`http://localhost:4000/api/get-audio/gemini/movie-search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ searchTerm, languageName })
      });

      if (!response.ok) {
        throw new Error(`Backend API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Backend response:', data);
      
      // Handle the response format from your backend
      // Your backend returns {status: 200}, {message: "Success"}, parsed_data
      // We need to extract the actual search results
      if (data && (data.results || data.original_query)) {
        return data;
      } else {
        // If the response structure is different, try to find the actual data
        const keys = Object.keys(data);
        for (const key of keys) {
          if (typeof data[key] === 'object' && data[key].results) {
            return data[key];
          }
        }
      }
      
      throw new Error('Invalid response format from backend');
    } catch (error) {
      console.error('Backend API failed:', error);
      throw error;
    }
  };

  // Main search function
  const performSearch = useCallback(async (searchTerm) => {
    if (searchTerm.trim().length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const searchResults = await searchWithGemini(searchTerm, selectedLanguage);
      
      if (searchResults?.results?.length > 0) {
        setResults(searchResults);
        onResultsReceived(searchResults);
      } else {
        setError(`No results found for "${searchTerm}". Try different keywords.`);
        setResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setError(`Search failed: ${error.message}`);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [backendUrl, selectedLanguage, onResultsReceived]);

  // Debounced search
  const handleSearch = useCallback((value) => {
    setQuery(value);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (value.trim().length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(value);
      }, 800);
    }
  }, [performSearch]);

  const getContentIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'movie': return <Film className="w-4 h-4 text-blue-500" />;
      case 'tv': return <Tv className="w-4 h-4 text-green-500" />;
      case 'music': return <Music className="w-4 h-4 text-purple-500" />;
      case 'documentary': return <FileText className="w-4 h-4 text-orange-500" />;
      default: return <Film className="w-4 h-4 text-gray-500" />;
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setError('');
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      console.log('Copied to clipboard:', text);
    });
  };

  const openImdbLink = (imdbId) => {
    if (imdbId) {
      window.open(`https://www.imdb.com/title/${imdbId}`, '_blank');
    }
  };

  const searchOnWatchMaze = (title, imdbId) => {
    // You can customize this function to integrate with WatchMaze API
    console.log('Searching on WatchMaze for:', { title, imdbId });
    // Example: Call your WatchMaze integration function here
    // watchMazeSearch(title, imdbId);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Search Input Container */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center p-4">
          {/* Language Selector */}
          <div className="flex items-center mr-4 bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-2">
            <Globe className="w-4 h-4 text-gray-400 mr-2" />
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="text-sm bg-transparent border-none focus:outline-none text-gray-700 dark:text-gray-300"
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code} className="bg-white dark:bg-gray-700">
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div className="flex-1 flex items-center">
            <Search className="w-5 h-5 text-gray-400 mr-3" />
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={placeholder}
              className="w-full bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-500 text-lg"
            />
          </div>

          {/* Loading/Clear Button */}
          <div className="ml-3">
            {loading ? (
              <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
            ) : query ? (
              <button
                onClick={clearSearch}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            ) : null}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-4 pb-4">
            <div className="flex items-center text-red-500 text-sm bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
              <AlertCircle className="w-4 h-4 mr-2" />
              {error}
            </div>
          </div>
        )}
      </div>

      {/* Results Display */}
      {results?.results?.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Search Results ({results.total_results || results.results.length})
            </h3>
            {results.corrected_query && results.corrected_query !== results.original_query && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Corrected: "{results.corrected_query}"
              </div>
            )}
          </div>

          <div className="space-y-3">
            {results.results.map((result, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  {getContentIcon(result.type)}
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {result.title}
                    </h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="capitalize">{result.type}</span>
                      {result.year && <span>{result.year}</span>}
                      {result.imdb_id && (
                        <span className="text-blue-600 dark:text-blue-400">
                          IMDB: {result.imdb_id}
                        </span>
                      )}
                      {result.language_detected && (
                        <span className="text-purple-600 dark:text-purple-400">
                          {result.language_detected}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {result.confidence && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {Math.round(result.confidence * 100)}% match
                    </div>
                  )}
                  
                  {/* WatchMaze Search Button */}
                  <button
                    onClick={() => searchOnWatchMaze(result.title, result.imdb_id)}
                    className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-xs hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                  >
                    WatchMaze
                  </button>

                  {result.imdb_id && (
                    <>
                      <button
                        onClick={() => openImdbLink(result.imdb_id)}
                        className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded-full text-xs hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors flex items-center space-x-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>IMDB</span>
                      </button>
                      <button
                        onClick={() => copyToClipboard(result.imdb_id)}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-xs hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                      >
                        Copy ID
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Additional Query Information */}
          {(results.query_type || results.language_detected) && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Query Analysis:</strong>
                {results.query_type && <span className="ml-2">Type: {results.query_type}</span>}
                {results.language_detected && <span className="ml-4">Language: {results.language_detected}</span>}
              </div>
            </div>
          )}

          {/* JSON Output */}
          <details className="mt-6">
            <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              View Raw JSON Output
            </summary>
            <div className="mt-3 p-4 bg-gray-100 dark:bg-gray-900 rounded-lg">
              <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(results, null, 2)}
              </pre>
              <button
                onClick={() => copyToClipboard(JSON.stringify(results, null, 2))}
                className="mt-2 px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Copy JSON
              </button>
            </div>
          </details>
        </div>
      )}

      {/* Usage Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">How to use:</h4>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Search in any language including Hinglish</li>
          <li>• Use descriptive queries like "romantic movie with singer"</li>
          <li>• Handles spelling mistakes automatically</li>
          <li>• Returns movie names with IMDB IDs when available</li>
          <li>• Click "WatchMaze" to search additional details</li>
          <li>• Click "IMDB" to open the movie page directly</li>
          <li>• Copy individual IMDB IDs or entire JSON response</li>
        </ul>
      </div>
    </div>
  );
};

export default SearchBar