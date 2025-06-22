import React, { useState } from 'react';
import SearchBar from './SearchBar';
import ContentSlider from './ContentCardSlider';

const SearchPage = ({ voiceQuery = '' }) => { 
  const [searchResults, setSearchResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [currentQuery, setCurrentQuery] = useState('');

  const handleSearchResults = (results:any) => {
    setSearchResults(results);
    setSearchError('');
  };

  const handleSearchError = (error:any) => {
    setSearchError(error);
    setSearchResults(null);
  };

  const handleLoadingChange = (loading:any) => {
    setIsLoading(loading);
  };

  const handleQueryChange = (query:any) => {
    setCurrentQuery(query);
  };

  const handleContentClick = (content:any) => {
    console.log('Content clicked:', content);
  };

  return (
    <div className="w-full bg-transparent-500 dark:bg-gray-900 py-2">
      <div className="container mx-auto px-4">
        <div className="mb-4">
          <SearchBar
            onResultsReceived={handleSearchResults}
            onError={handleSearchError}
            onLoadingChange={handleLoadingChange}
            onQueryChange={handleQueryChange}
            voiceQuery={voiceQuery} // Pass voice query to SearchBar
            placeholder="Search movies, TV shows, songs, documentaries..."
          />
        </div>

        {(searchResults?.results?.length > 0 || isLoading) && (
          <ContentSlider
            title="Search Results"
            searchResults={searchResults}
            isLoading={isLoading}
            onContentClick={handleContentClick}
            showSearchInfo={true}
            className="mb-8"
          />
        )}

        {searchError && !isLoading && (
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {searchError}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;