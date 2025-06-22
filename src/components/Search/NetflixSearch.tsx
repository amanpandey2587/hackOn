import React, { useState } from 'react';
import Netbar from './Netbar';
import ContentSlider from './ContentCardSlider';

const NetflixSearch = ({ voiceQuery = '' }) => { 
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
    <div className="w-full bg-transparent py-6 ">
  <div className="max-w-screen-xl mx-auto px-4">
    
    {/* Netbar */}
    <div className="mb-6">
      <Netbar
        onResultsReceived={handleSearchResults}
        onError={handleSearchError}
        onLoadingChange={handleLoadingChange}
        onQueryChange={handleQueryChange}
        voiceQuery={voiceQuery}
        placeholder="Search movies, TV shows, songs, documentaries..."
      />
    </div>

    {/* Search Results Slider */}
    {(searchResults?.results?.length > 0 || isLoading) && (
      <ContentSlider
        title="Search Results"
        searchResults={searchResults}
        isLoading={isLoading}
        onContentClick={handleContentClick}
        showSearchInfo={true}
        className="mb-10"
      />
    )}

    {/* Search Error */}
    {searchError && !isLoading && (
      <div className="flex justify-center mt-8">
        <div className="flex items-center px-6 py-3 bg-red-900/40 text-red-400 rounded-lg text-base">
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

export default NetflixSearch;