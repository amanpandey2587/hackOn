import React, { useState, useEffect } from 'react';
import { Play, Info, Plus, ThumbsUp, Star, Calendar, Tv } from 'lucide-react';

const webSeriesCache = new Map();
const episodeCache = new Map();

const WebSeries = ({ seriesId, onWatchEpisode, onShowDetails }) => {
  const [seriesData, setSeriesData] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [loading, setLoading] = useState(true);
  const [episodeLoading, setEpisodeLoading] = useState(false);

  const WATCHMODE_API_KEY = 'YOUR_WATCHMODE_API_KEY';
  const YOUTUBE_API_KEY = 'YOUR_YOUTUBE_API_KEY';

  const fetchSeriesData = async (id) => {
    if (webSeriesCache.has(id)) {
      return webSeriesCache.get(id);
    }

    if (!WATCHMODE_API_KEY || WATCHMODE_API_KEY === 'YOUR_WATCHMODE_API_KEY') {
      const mockData = {
        id: id,
        title: "Breaking Bad",
        overview: "A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine in order to secure his family's future.",
        poster_path: "https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
        backdrop_path: "https://image.tmdb.org/t/p/original/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg",
        release_date: "2008-01-20",
        vote_average: 9.5,
        seasons: 5,
        total_episodes: 62,
        status: 'Ended',
        network: 'AMC',
        runtime: 47,
        genres: ['Crime', 'Drama', 'Thriller']
      };
      webSeriesCache.set(id, mockData);
      return mockData;
    }

    try {
      const response = await fetch(
        `https://api.watchmode.com/v1/title/${id}/details/?apikey=${WATCHMODE_API_KEY}`
      );
      const data = await response.json();
      
      const processedData = {
        id: data.id,
        title: data.title,
        overview: data.plot_overview,
        poster_path: data.poster,
        backdrop_path: data.backdrop,
        release_date: data.release_date,
        vote_average: data.user_rating,
        seasons: data.season_count,
        total_episodes: data.episode_count,
        status: data.end_year ? 'Ended' : 'Ongoing',
        network: data.network_names?.[0],
        runtime: data.runtime_minutes,
        genres: data.genre_names || []
      };

      webSeriesCache.set(id, processedData);
      return processedData;
    } catch (error) {
      console.error('Error fetching series data:', error);
      return null;
    }
  };

  const fetchSeasonEpisodes = async (seriesId, seasonNumber) => {
    const cacheKey = `${seriesId}-season-${seasonNumber}`;
    
    if (episodeCache.has(cacheKey)) {
      return episodeCache.get(cacheKey);
    }

    if (!WATCHMODE_API_KEY || WATCHMODE_API_KEY === 'YOUR_WATCHMODE_API_KEY') {
      const mockEpisodes = Array.from({ length: seasonNumber === 1 ? 7 : 13 }, (_, i) => ({
        id: `ep-${seasonNumber}-${i + 1}`,
        episode_number: i + 1,
        season_number: seasonNumber,
        title: `Episode ${i + 1}`,
        overview: `Episode ${i + 1} of season ${seasonNumber}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
        still_path: `https://image.tmdb.org/t/p/w500/placeholder-episode-${i + 1}.jpg`,
        air_date: `2008-0${seasonNumber}-${String(i + 1).padStart(2, '0')}`,
        vote_average: 8.0 + Math.random() * 1.5,
        runtime: 45 + Math.floor(Math.random() * 10)
      }));

      episodeCache.set(cacheKey, mockEpisodes);
      return mockEpisodes;
    }

    try {
      const response = await fetch(
        `https://api.watchmode.com/v1/title/${seriesId}/season/${seasonNumber}/?apikey=${WATCHMODE_API_KEY}`
      );
      const data = await response.json();
      
      const episodes = data.episodes?.map(ep => ({
        id: ep.id,
        episode_number: ep.episode_number,
        season_number: ep.season_number,
        title: ep.title,
        overview: ep.plot_overview,
        still_path: ep.still_path,
        air_date: ep.release_date,
        vote_average: ep.user_rating,
        runtime: ep.runtime_minutes
      })) || [];

      episodeCache.set(cacheKey, episodes);
      return episodes;
    } catch (error) {
      console.error('Error fetching episodes:', error);
      return [];
    }
  };

  const fetchTrailer = async (title, seasonNumber, episodeNumber = null) => {
    if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === 'YOUR_YOUTUBE_API_KEY') {
      return {
        videoId: 'HhesaQXLuRY', 
        title: `${title} - ${episodeNumber ? `Season ${seasonNumber} Episode ${episodeNumber}` : `Season ${seasonNumber}`} Trailer`,
        thumbnail: 'https://img.youtube.com/vi/HhesaQXLuRY/maxresdefault.jpg'
      };
    }

    try {
      const searchQuery = episodeNumber 
        ? `${title} season ${seasonNumber} episode ${episodeNumber} preview`
        : `${title} season ${seasonNumber} trailer`;
        
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&key=${YOUTUBE_API_KEY}&maxResults=1`
      );
      const data = await response.json();
      
      if (data.items && data.items.length > 0) {
        const video = data.items[0];
        return {
          videoId: video.id.videoId,
          title: video.snippet.title,
          thumbnail: video.snippet.thumbnails.high.url
        };
      }
    } catch (error) {
      console.error('Error fetching trailer:', error);
    }
    return null;
  };

  useEffect(() => {
    const loadSeriesData = async () => {
      setLoading(true);
      const data = await fetchSeriesData(seriesId);
      if (data) {
        setSeriesData(data);
        const seasonNumbers = Array.from({ length: data.seasons }, (_, i) => i + 1);
        setSeasons(seasonNumbers);
      }
      setLoading(false);
    };

    loadSeriesData();
  }, [seriesId]);

  useEffect(() => {
    if (seriesData && selectedSeason) {
      const loadEpisodes = async () => {
        setEpisodeLoading(true);
        const episodeData = await fetchSeasonEpisodes(seriesId, selectedSeason);
        setEpisodes(episodeData);
        setEpisodeLoading(false);
      };

      loadEpisodes();
    }
  }, [seriesId, selectedSeason, seriesData]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const handlePlayEpisode = async (episode) => {
    const trailer = await fetchTrailer(seriesData.title, episode.season_number, episode.episode_number);
    onWatchEpisode({
      ...episode,
      seriesTitle: seriesData.title,
      trailer: trailer
    });
  };

  if (loading) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading series data...</div>
      </div>
    );
  }

  if (!seriesData) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Series not found</div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen">
      <div className="relative h-[50vh] w-full overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${seriesData.backdrop_path})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />
        </div>
        
        <div className="relative z-10 flex h-full items-center px-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <Tv className="w-5 h-5 text-white" />
              <span className="text-white/80 text-sm uppercase tracking-wide">TV Series</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              {seriesData.title}
            </h1>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="text-white font-semibold">{seriesData.vote_average}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-white/80" />
                <span className="text-white/80">{new Date(seriesData.release_date).getFullYear()}</span>
              </div>
              <span className="text-white/80">•</span>
              <span className="text-white/80">{seriesData.seasons} Seasons</span>
              <span className="text-white/80">•</span>
              <span className="text-white/80">{seriesData.total_episodes} Episodes</span>
            </div>
            
            <p className="text-white/90 text-lg mb-8 leading-relaxed max-w-xl">
              {seriesData.overview}
            </p>
            
            <div className="flex gap-4">
              <button 
                className="flex items-center gap-2 bg-white text-black px-8 py-3 rounded-md font-semibold hover:bg-white/90 transition-colors"
                onClick={() => onShowDetails && onShowDetails(seriesData)}
              >
                <Info className="w-5 h-5" />
                More Info
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        <div className="flex items-center gap-4 mb-6">
          <h2 className="text-white text-2xl font-bold">Episodes</h2>
          <select
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(parseInt(e.target.value))}
            className="bg-gray-800 text-white px-4 py-2 rounded-md border border-gray-600 focus:border-white focus:outline-none"
          >
            {seasons.map(season => (
              <option key={season} value={season}>
                Season {season}
              </option>
            ))}
          </select>
        </div>

        {episodeLoading ? (
          <div className="text-white text-center py-8">Loading episodes...</div>
        ) : (
          <div className="grid gap-4">
            {episodes.map((episode, index) => (
              <div
                key={episode.id}
                className="bg-gray-900 rounded-lg p-4 hover:bg-gray-800 transition-colors cursor-pointer group"
                onClick={() => handlePlayEpisode(episode)}
              >
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                      {index + 1}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-white font-semibold text-lg mb-1">
                          {episode.title}
                        </h3>
                        <p className="text-white/70 text-sm mb-2 line-clamp-2">
                          {episode.overview}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-white/60">
                          <span>{episode.runtime} min</span>
                          <span>{formatDate(episode.air_date)}</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span>{episode.vote_average?.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors backdrop-blur-sm">
                          <Play className="w-4 h-4 text-white fill-current" />
                        </button>
                        <button className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors backdrop-blur-sm">
                          <Plus className="w-4 h-4 text-white" />
                        </button>
                        <button className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors backdrop-blur-sm">
                          <ThumbsUp className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WebSeries;