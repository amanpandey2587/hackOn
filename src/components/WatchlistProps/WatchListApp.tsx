import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AddToWatchlistButton from './AddToWatchListButton';
import WatchlistDisplay from './WatchListDisplay';
import WatchlistStatistics from './WatchListDisplay';
import NextToWatch from './NextToWatch';
import { Film, BarChart3, Play, List } from 'lucide-react';

// Example movie/series data - replace with your actual data
const exampleContent = [
  {
    contentId: 'movie_1',
    contentType: 'movie' as const,
    title: 'The Dark Knight',
    genre: ['Action', 'Crime', 'Drama'],
    estimatedDuration: 152
  },
  {
    contentId: 'series_1',
    contentType: 'series' as const,
    title: 'Breaking Bad',
    genre: ['Crime', 'Drama', 'Thriller'],
    estimatedDuration: 2400
  },
  {
    contentId: 'movie_2',
    contentType: 'movie' as const,
    title: 'Inception',
    genre: ['Action', 'Sci-Fi', 'Thriller'],
    estimatedDuration: 148
  }
];

const WatchlistApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState('watchlist');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAddSuccess = () => {
    // Trigger refresh of watchlist components
    setRefreshTrigger(prev => prev + 1);
    
    // Show success message
    alert('Added to watchlist successfully!');
  };

  const handleAddError = (error: string) => {
    alert(`Failed to add to watchlist: ${error}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Watchlist Manager</h1>
          <p className="text-gray-600">Manage your movies and series to watch</p>
        </div>

        {/* Example Content Section - Replace with your actual content */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Example Content</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exampleContent.map((content) => (
              <div key={content.contentId} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-800">{content.title}</h3>
                    <p className="text-sm text-gray-600 capitalize">{content.contentType}</p>
                  </div>
                  <Film className="w-5 h-5 text-gray-400" />
                </div>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {content.genre.map((g, idx) => (
                    <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded">
                      {g}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {content.estimatedDuration} min
                  </span>
                  <AddToWatchlistButton
                    contentId={content.contentId}
                    contentType={content.contentType}
                    title={content.title}
                    genre={content.genre}
                    estimatedDuration={content.estimatedDuration}
                    priority={3}
                    onSuccess={handleAddSuccess}
                    onError={handleAddError}
                    className="text-sm px-3 py-1"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="watchlist" className="flex items-center gap-2">
              <List className="w-4 h-4" />
              Watchlist
            </TabsTrigger>
            <TabsTrigger value="next" className="flex items-center gap-2">
              <Play className="w-4 h-4" />
              Next to Watch
            </TabsTrigger>
            <TabsTrigger value="statistics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Statistics
            </TabsTrigger>
            <TabsTrigger value="manage" className="flex items-center gap-2">
              <Film className="w-4 h-4" />
              Manage
            </TabsTrigger>
          </TabsList>

          <TabsContent value="watchlist">
            <WatchlistDisplay key={refreshTrigger} />
          </TabsContent>

          <TabsContent value="next">
            <NextToWatch 
              key={refreshTrigger} 
              limit={10}
              onItemSelect={(item) => {
                console.log('Selected item to watch:', item);
                // Handle item selection (e.g., navigate to watch page)
              }}
            />
          </TabsContent>

          <TabsContent value="statistics">
            <WatchlistStatistics key={refreshTrigger} />
          </TabsContent>

          <TabsContent value="manage">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                    <div className="font-medium text-blue-900">Export Watchlist</div>
                    <div className="text-sm text-blue-600">Download your watchlist as CSV</div>
                  </button>
                  <button className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                    <div className="font-medium text-green-900">Import from File</div>
                    <div className="text-sm text-green-600">Import watchlist from CSV/JSON</div>
                  </button>
                  <button className="w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                    <div className="font-medium text-purple-900">Clear Completed</div>
                    <div className="text-sm text-purple-600">Remove all watched items</div>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Watchlist Tips</h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Use priority levels to organize what to watch first</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Add estimated duration to plan your viewing time</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Use genres to filter and find content by mood</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Check "Next to Watch" for personalized recommendations</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default WatchlistApp;