// import React from 'react';
// import { Search, Mic, Settings, Grid3X3 } from 'lucide-react';

// const StreamingNavigationBanner = ({ onAppSelect, isSignedIn, onAuthAction }) => {
//   const streamingApps = [
//     { name: 'Netflix', color: 'bg-red-600', icon: 'N' },
//     { name: 'YouTube', color: 'bg-red-500', icon: '▶' },
//     { name: 'Prime Video', color: 'bg-blue-600', icon: 'prime' },
//     { name: 'Amazon Music', color: 'bg-cyan-500', icon: '♪' },
//     { name: 'JioCinema', color: 'bg-purple-600', icon: 'J' },
//     { name: 'SonyLIV', color: 'bg-blue-500', icon: 'S' }
//   ];

//   return (
//     <div className="bg-gradient-to-r from-blue-900 via-purple-900 to-blue-800 px-8 py-4 relative z-10">
//       <div className="flex items-center justify-between mb-6">
//         <div className="flex items-center space-x-6">
//           <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
//             <div className="w-6 h-6 bg-white rounded-full"></div>
//           </div>
//           <div className="w-8 h-8 bg-white bg-opacity-20 rounded flex items-center justify-center">
//             <div className="w-4 h-4 border-2 border-white"></div>
//           </div>
//           <Search className="w-6 h-6 text-white cursor-pointer hover:text-blue-300 transition-colors" />
//           <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
//             <div className="w-3 h-3 bg-white rounded-full"></div>
//           </div>
//           <div className="w-6 h-6 bg-white bg-opacity-20 rounded flex items-center justify-center">
//             <div className="w-4 h-4 border border-white"></div>
//           </div>
//           <div className="w-6 h-6 bg-white bg-opacity-20 rounded flex items-center justify-center">
//             <div className="w-4 h-4 border border-white"></div>
//           </div>
//         </div>

//         <div className="flex items-center space-x-4">
//           {streamingApps.map((app, index) => (
//             <div
//               key={app.name}
//               onClick={() => onAppSelect && onAppSelect(app.name.toLowerCase().replace(' ', ''))}
//               className={`${app.color} px-4 py-2 rounded-lg cursor-pointer hover:scale-105 transition-transform duration-200 flex items-center justify-center min-w-[80px] h-10`}
//             >
//               <span className="text-white font-bold text-sm">
//                 {app.name === 'Prime Video' ? 'prime video' : 
//                  app.name === 'Amazon Music' ? 'amazon music' :
//                  app.name === 'JioCinema' ? 'JioCinema' :
//                  app.name === 'SonyLIV' ? 'SonyLIV' :
//                  app.icon}
//               </span>
//             </div>
//           ))}
//         </div>

//         <div className="flex items-center space-x-6">
//           <Grid3X3 className="w-6 h-6 text-white cursor-pointer hover:text-blue-300 transition-colors" />
//           <Settings className="w-6 h-6 text-white cursor-pointer hover:text-blue-300 transition-colors" />
//         </div>
//       </div>

//       <div className="flex items-center justify-between">
//         <div className="flex-1 max-w-md">
//           <h2 className="text-white text-xl font-semibold mb-3">Find</h2>
//           <div className="relative">
//             <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//             <input
//               type="text"
//               placeholder="Search"
//               className="w-full bg-blue-800 bg-opacity-50 text-white placeholder-gray-300 pl-12 pr-4 py-3 rounded-full border border-blue-700 focus:outline-none focus:border-blue-500 focus:bg-opacity-70 transition-all"
//             />
//           </div>
//         </div>

//         <div className="flex items-center space-x-2 text-white">
//           <span className="text-sm">Press and hold</span>
//           <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
//             <Mic className="w-4 h-4" />
//           </div>
//           <span className="text-sm">to voice search</span>
//         </div>
//       </div>

//       {!isSignedIn && (
//         <div className="flex items-center space-x-4 mt-6 justify-center">
//           <button
//             onClick={() => onAuthAction && onAuthAction('signin')}
//             className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors duration-200"
//           >
//             Sign In
//           </button>
//           <button
//             onClick={() => onAuthAction && onAuthAction('signup')}
//             className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors duration-200"
//           >
//             Sign Up
//           </button>
//         </div>
//       )}

//       <div className="flex items-center justify-center space-x-6 mt-8">
//         {['Drama', 'Appstore', 'Movies', 'TV Shows', 'Action Movies'].map((category, index) => {
//           const colors = [
//             'bg-gradient-to-br from-yellow-400 to-yellow-600',
//             'bg-gradient-to-br from-pink-400 to-pink-600', 
//             'bg-gradient-to-br from-purple-500 to-purple-700',
//             'bg-gradient-to-br from-orange-400 to-orange-600',
//             'bg-gradient-to-br from-purple-600 to-purple-800'
//           ];
          
//           return (
//             <div
//               key={category}
//               className={`${colors[index]} px-8 py-6 rounded-xl cursor-pointer hover:scale-105 transition-transform duration-200 min-w-[120px] h-20 flex items-center justify-center`}
//             >
//               <span className="text-white font-bold text-lg">{category}</span>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// export default StreamingNavigationBanner;