// import React from "react";
// import { useSelector, useDispatch } from "react-redux";
// import type {RootState}  from "../../redux/store";
// import { setOpen } from "../../redux/movieSlice";
// import VideoBackground from "./VideoBackground";

// export default function MovieDialog() {
//   const { open, id } = useSelector((store:  RootState) => store.movie);
//   const dispatch = useDispatch();

//   const handleClose = () => {
//     dispatch(setOpen(false));
//   };

//   if (!open) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
//       <div className="bg-gray-900 rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
//         <div className="relative">
//           <button
//             onClick={handleClose}
//             className="absolute top-4 right-4 z-10 w-8 h-8 bg-black bg-opacity-50 rounded-full flex items-center justify-center text-white hover:bg-opacity-70 transition-all"
//           >
//             ×
//           </button>
          
//           <div className="p-4">
//             {id && <VideoBackground movieId={id} bool={true} />}
//           </div>
          
//           <div className="p-4 border-t border-gray-700">
//             <button
//               onClick={handleClose}
//               className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
//             >
//               Close
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
import React from 'react'

const MovieDialog = () => {
  return (
    <div>
      Z
    </div>
  )
}

export default MovieDialog
