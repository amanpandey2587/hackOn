import React, { useState, useEffect } from 'react';
import { Play, Info, Plus, ThumbsUp, ChevronLeft, ChevronRight, Star, Calendar, Tv, Film } from 'lucide-react';

const mockData = [
  {
    id: "1",
    title: "The Dark Knight",
    overview: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
    poster_path: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    backdrop_path: "https://image.tmdb.org/t/p/original/hqkIcbrOHL86UncnHIsHVcVmzue.jpg",
    release_date: "2008-07-18",
    vote_average: 9.0,
    is_tv_series: false
  },
  {
    id: "2", 
    title: "Breaking Bad",
    overview: "A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine in order to secure his family's future.",
    poster_path: "https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
    backdrop_path: "https://image.tmdb.org/t/p/original/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg",
    release_date: "2008-01-20",
    vote_average: 9.5,
    is_tv_series: true
  },
  {
    id: "3",
    title: "Inception",
    overview: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    poster_path: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
    backdrop_path: "https://image.tmdb.org/t/p/original/s3TBrRGB1iav7gFOCNx3H31MoES.jpg",
    release_date: "2010-07-16",
    vote_average: 8.8,
    is_tv_series: false
  }
];

const StreamingPlatform = () => {
  const [content, setContent] = useState(mockData);
  const [selectedContent, setSelectedContent] = useState(null);
  const [trailerData, setTrailerData] = useState({});
  const [tvSeriesData, setTvSeriesData] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const YOUTUBE_API_KEY = 'YOUR_YOUTUBE_API_KEY'; 
  const WATCHMODE_API_KEY = 'YOUR_WATCHMODE_API_KEY'; 

  const fetchTrailer = async (title, year) => {
    if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === 'YOUR_YOUTUBE_API_KEY') {
      return {
        videoId: 'EXeTwQWrcwY', 
        title: `${title} - Official Trailer`,
        thumbnail: `https://img.youtube.com/vi/EXeTwQWrcwY/maxresdefault.jpg`
      };
    }

    try {
      const searchQuery = `${title} ${year} official trailer`;
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

  const fetchTvSeriesData = async (title) => {
    if (!WATCHMODE_API_KEY || WATCHMODE_API_KEY === 'YOUR_WATCHMODE_API_KEY') {
      // Mock TV series data for demo
      return {
        seasons: 5,
        episodes: 62,
        status: 'Ended',
        network: 'AMC',
        runtime: 47
      };
    }

    try {
      const response = await fetch(
        `https://api.watchmode.com/v1/search/?apikey=${WATCHMODE_API_KEY}&search_field=name&search_value=${encodeURIComponent(title)}`
      );
      const data = await response.json();
      
      if (data.title_results && data.title_results.length > 0) {
        const series = data.title_results[0];
        return {
          seasons: series.season_count || 'N/A',
          episodes: series.episode_count || 'N/A',
          status: series.end_year ? 'Ended' : 'Ongoing',
          network: series.network_names?.[0] || 'N/A',
          runtime: series.runtime_minutes || 'N/A'
        };
      }
    } catch (error) {
      console.error('Error fetching TV series data:', error);
    }
    return null;
  };

  const loadContentData = async (item) => {
    setLoading(true);
    
    try {
      const year = item.release_date ? new Date(item.release_date).getFullYear() : '';
      const trailer = await fetchTrailer(item.title, year);
      
      if (trailer) {
        setTrailerData(prev => ({
          ...prev,
          [item.id]: trailer
        }));
      }

      if (item.is_tv_series) {
        const tvData = await fetchTvSeriesData(item.title);
        if (tvData) {
          setTvSeriesData(prev => ({
            ...prev,
            [item.id]: tvData
          }));
        }
      }
    } catch (error) {
      console.error('Error loading content data:', error);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    content.forEach(item => {
      loadContentData(item);
    });
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % content.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + content.length) % content.length);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).getFullYear();
  };

  const HeroSection = ({ item }) => {
    const trailer = trailerData[item.id];
    const tvData = tvSeriesData[item.id];

    return (
      <div className="relative h-[70vh] w-full overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${item.backdrop_path || item.poster_path})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />
        </div>
        
        <div className="relative z-10 flex h-full items-center px-12">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              {item.is_tv_series ? (
                <Tv className="w-5 h-5 text-white" />
              ) : (
                <Film className="w-5 h-5 text-white" />
              )}
              <span className="text-white/80 text-sm uppercase tracking-wide">
                {item.is_tv_series ? 'TV Series' : 'Movie'}
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">
              {item.title}
            </h1>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="text-white font-semibold">{item.vote_average}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-white/80" />
                <span className="text-white/80">{formatDate(item.release_date)}</span>
              </div>
              {item.is_tv_series && tvData && (
                <>
                  <span className="text-white/80">•</span>
                  <span className="text-white/80">{tvData.seasons} Seasons</span>
                  <span className="text-white/80">•</span>
                  <span className="text-white/80">{tvData.episodes} Episodes</span>
                </>
              )}
            </div>
            
            <p className="text-white/90 text-lg mb-8 leading-relaxed max-w-xl">
              {item.overview}
            </p>
            
            <div className="flex gap-4">
              <button 
                className="flex items-center gap-2 bg-white text-black px-8 py-3 rounded-md font-semibold hover:bg-white/90 transition-colors"
                onClick={() => trailer && window.open(`https://www.youtube.com/watch?v=${trailer.videoId}`, '_blank')}
              >
                <Play className="w-5 h-5 fill-current" />
                {trailer ? 'Watch Trailer' : 'Play'}
              </button>
              <button 
                className="flex items-center gap-2 bg-white/20 text-white px-8 py-3 rounded-md font-semibold hover:bg-white/30 transition-colors backdrop-blur-sm"
                onClick={() => setSelectedContent(item)}
              >
                <Info className="w-5 h-5" />
                More Info
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ContentRow = ({ title, items }) => (
    <div className="px-12 py-8">
      <h2 className="text-white text-2xl font-bold mb-6">{title}</h2>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {items.map((item) => (
          <div
            key={item.id}
            className="min-w-[300px] group cursor-pointer transition-transform hover:scale-105"
            onClick={() => setSelectedContent(item)}
          >
            <div className="relative overflow-hidden rounded-lg">
              <img
                src={item.poster_path || item.backdrop_path}
                alt={item.title}
                className="w-full h-[450px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-white font-bold text-lg mb-2">{item.title}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-white text-sm">{item.vote_average}</span>
                    <span className="text-white/80 text-sm">•</span>
                    <span className="text-white/80 text-sm">{formatDate(item.release_date)}</span>
                  </div>
                  <div className="flex gap-2">
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
    </div>
  );

  const Modal = ({ item, onClose }) => {
    const trailer = trailerData[item.id];
    const tvData = tvSeriesData[item.id];

    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="relative">
            <img
              src={item.backdrop_path || item.poster_path}
              alt={item.title}
              className="w-full h-64 object-cover rounded-t-lg"
            />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white hover:text-gray-300 text-2xl font-bold"
            >
              ×
            </button>
            <div className="absolute bottom-4 left-6">
              <h2 className="text-white text-3xl font-bold">{item.title}</h2>
            </div>
          </div>
          
          <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="text-white font-semibold">{item.vote_average}</span>
              </div>
              <span className="text-white/80">{formatDate(item.release_date)}</span>
              {item.is_tv_series ? (
                <span className="bg-red-600 text-white px-2 py-1 rounded text-sm">TV Series</span>
              ) : (
                <span className="bg-blue-600 text-white px-2 py-1 rounded text-sm">Movie</span>
              )}
            </div>

            {item.is_tv_series && tvData && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-white/10 rounded-lg">
                <div>
                  <span className="text-white/80 text-sm">Seasons</span>
                  <p className="text-white font-semibold">{tvData.seasons}</p>
                </div>
                <div>
                  <span className="text-white/80 text-sm">Episodes</span>
                  <p className="text-white font-semibold">{tvData.episodes}</p>
                </div>
                <div>
                  <span className="text-white/80 text-sm">Status</span>
                  <p className="text-white font-semibold">{tvData.status}</p>
                </div>
                <div>
                  <span className="text-white/80 text-sm">Network</span>
                  <p className="text-white font-semibold">{tvData.network}</p>
                </div>
              </div>
            )}
            
            <p className="text-white/90 text-lg leading-relaxed mb-6">
              {item.overview}
            </p>
            
            <div className="flex gap-4">
              <button 
                className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-md font-semibold hover:bg-white/90 transition-colors"
                onClick={() => trailer && window.open(`https://www.youtube.com/watch?v=${trailer.videoId}`, '_blank')}
              >
                <Play className="w-5 h-5 fill-current" />
                {trailer ? 'Watch Trailer' : 'Play'}
              </button>
              <button className="flex items-center gap-2 bg-white/20 text-white px-6 py-3 rounded-md font-semibold hover:bg-white/30 transition-colors backdrop-blur-sm">
                <Plus className="w-5 h-5" />
                My List
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-black min-h-screen">
      <div className="relative">
        <HeroSection item={content[currentSlide]} />
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors backdrop-blur-sm"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors backdrop-blur-sm"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      <ContentRow title="Trending Now" items={content} />
      <ContentRow title="Movies" items={content.filter(item => !item.is_tv_series)} />
      <ContentRow title="TV Series" items={content.filter(item => item.is_tv_series)} />

      {selectedContent && (
        <Modal 
          item={selectedContent} 
          onClose={() => setSelectedContent(null)} 
        />
      )}

      {loading && (
        <div className="fixed bottom-4 right-4 bg-white/20 text-white px-4 py-2 rounded-md backdrop-blur-sm">
          Loading content data...
        </div>
      )}
    </div>
  );
};

export default StreamingPlatform;