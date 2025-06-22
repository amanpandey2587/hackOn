import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Search, X, Globe, AlertCircle, Loader2 } from 'lucide-react';

const NetBar = ({ 
  backendUrl = '',
  onResultsReceived = () => {},
  onError = () => {},
  onLoadingChange = () => {},
  placeholder = "Search movies, TV shows, songs, documentaries...",
  onQueryChange = () => {},
  voiceQuery = '' // New prop for voice input
}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const searchTimeoutRef = useRef(null);

  // Effect to handle voice query updates
  useEffect(() => {
    if (voiceQuery && voiceQuery.trim()) {
      console.log("Search query in NetBar is",voiceQuery)
      setQuery(voiceQuery);
      // Trigger search with voice query
      handleSearch(voiceQuery);
    }
  }, [voiceQuery]);

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
      
      if (data && (data.results || data.original_query)) {
        return data;
      } else {
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

  const performSearch = useCallback(async (searchTerm) => {
    if (searchTerm.trim().length < 2) {
      onResultsReceived([]);
      return;
    }

    setLoading(true);
    setError('');
    onLoadingChange(true);

    try {
      const searchResults = await searchWithGemini(searchTerm, selectedLanguage);
      
      if (searchResults?.results?.length > 0) {
        onResultsReceived(searchResults);
      } else {
        const errorMsg = `No results found for "${searchTerm}". Try different keywords.`;
        setError(errorMsg);
        onError(errorMsg);
        onResultsReceived([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      const errorMsg = `Search failed: ${error.message}`;
      setError(errorMsg);
      onError(errorMsg);
      onResultsReceived([]);
    } finally {
      setLoading(false);
      onLoadingChange(false);
    }
  }, [backendUrl, selectedLanguage, onResultsReceived, onError, onLoadingChange]);

  const handleSearch = useCallback((value) => {
    setQuery(value);
    onQueryChange(value); // Notify parent of query change
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (value.trim().length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(value);
      }, 800);
    } else {
      onResultsReceived([]);
      setError('');
    }
  }, [performSearch, onResultsReceived, onQueryChange]);

  const clearSearch = () => {
    setQuery('');
    setError('');
    onResultsReceived([]);
    onQueryChange(''); // Notify parent of cleared query
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
  };

  return (
    <div className="w-full mx-auto">
  <div className="bg-transparent/80 text-white rounded-2xl shadow-md border border-red-700/40">
    
    <div className="flex items-center p-4">
      
      {/* Language Selector */}
      <div className="flex items-center mr-4 bg-black/60 rounded-lg px-3 py-2 border border-red-700/40">
        <Globe className="w-4 h-4 text-red-500 mr-2" />
        <select
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          className="text-sm bg-transparent border-none focus:outline-none text-white"
        >
          {languages.map(lang => (
            <option key={lang.code} value={lang.code} className="bg-black text-white">
              {lang.flag} {lang.name}
            </option>
          ))}
        </select>
      </div>

      {/* Search Input */}
      <div className="flex-1 flex items-center">
        <Search className="w-5 h-5 text-red-500 mr-3" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent border-none outline-none text-white placeholder-red-300 text-lg"
        />
      </div>

      {/* Clear or Loading */}
      <div className="ml-3">
        {loading ? (
          <Loader2 className="w-5 h-5 text-red-500 animate-spin" />
        ) : query ? (
          <button
            onClick={clearSearch}
            className="p-2 hover:bg-red-700/30 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-red-500" />
          </button>
        ) : null}
      </div>

    </div>

    {/* Error */}
    {error && (
      <div className="px-4 pb-4">
        <div className="flex items-center text-red-500 text-sm bg-red-900/20 rounded-lg p-3">
          <AlertCircle className="w-4 h-4 mr-2" />
          {error}
        </div>
      </div>
    )}

  </div>
</div>

  );
};

export default NetBar;