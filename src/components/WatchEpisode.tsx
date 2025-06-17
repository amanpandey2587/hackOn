// import React from 'react'
// import { setLoading } from '../redux/userSlice';



// interface MovieCardProps {
//   posterPath?: string;
//   movieId: string;
//   title?: string;
//   rating?: number;
//   releaseDate?: string;
// }

// const WatchMovie: React.FC<MovieCardProps> = ({
//   posterPath,
//   movieId,
//   title,
//   rating,
//   releaseDate
// }) => {

//   const YOUTUBE_API_KEY = 'YOUR_YOUTUBE_API_KEY'; // Replace with actual API key
//   const WATCHMODE_API_KEY = 'YOUR_WATCHMODE_API_KEY'; // Replace with actual API key

//   // Fetch YouTube trailer
//   const fetchTrailer = async (title, releaseDate) => {
//     const year=new Date(releaseDate).getFullYear();
//     if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === 'YOUR_YOUTUBE_API_KEY') {
//       // Mock trailer data for demo
//       return {
//         videoId: 'EXeTwQWrcwY', // The Dark Knight trailer
//         title: `${title} - Official Trailer`,
//         thumbnail: `https://img.youtube.com/vi/EXeTwQWrcwY/maxresdefault.jpg`
//       };
//     }

//     try {
//       const searchQuery = `${title} ${year} official trailer`;
//       const response = await fetch(
//         `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&key=${YOUTUBE_API_KEY}&maxResults=1`
//       );
//       const data = await response.json();
//       console.log("Youtube api key data is",data);
//       if (data.items && data.items.length > 0) {
//         const video = data.items[0];
//         return {
//           videoId: video.id.videoId,
//           title: video.snippet.title,
//           thumbnail: video.snippet.thumbnails.high.url
//         };
//       }
//     } catch (error) {
//       console.error('Error fetching trailer:', error);
//     }
//     return null;
//   };
//   const loadContentData=async(title,releaseDate)=>{
//     setLoading(true);
//     try{
//       const trailer=await fetchTrailer(title,releaseDate);
//       if(trailer){
//         setTrailerData(prev=>({
//           ...prev,
//           [movieId]:trailer
//         }))
//       }
//     }catch(error){
//       console.error("Error loading contetn data",error);
//     }
//     setLoading(false);
//   }
//   return (
//     <div>
      
//     </div>
//   )
// }

// export default WatchMovie
