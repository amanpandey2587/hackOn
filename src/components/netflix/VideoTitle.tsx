import React from 'react';
import { CiPlay1 } from "react-icons/ci";
import { CiCircleInfo } from "react-icons/ci";
import { FaPlay, FaPlus, FaThumbsUp, FaVolumeUp } from "react-icons/fa";
import { BsInfoCircle } from "react-icons/bs";

interface VideoTitleProps {
  title: string;
  overview: string;
}

const VideoTitle: React.FC<VideoTitleProps> = () => {
  return (
    <div className="flex flex-col justify-end h-full">
        <h1>title</h1>
        <p>overview</p>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <button className="flex items-center justify-center px-8 py-3 bg-white text-black rounded-md hover:bg-gray-200 transition-all duration-200 font-semibold text-lg min-w-[140px] group">
          <FaPlay className="mr-3 text-black group-hover:scale-110 transition-transform" size="20px" />
          <span>Play</span>
        </button>
        
        <button className="flex items-center justify-center px-8 py-3 bg-gray-600 bg-opacity-70 text-white rounded-md hover:bg-opacity-90 transition-all duration-200 font-semibold text-lg min-w-[140px] group backdrop-blur-sm">
          <BsInfoCircle className="mr-3 group-hover:scale-110 transition-transform" size="20px" />
          <span>More Info</span>
        </button>
      </div>

      <div className="flex gap-3 mb-8">
        <button className="flex items-center justify-center w-12 h-12 bg-gray-800 bg-opacity-70 text-white rounded-full hover:bg-opacity-90 transition-all duration-200 group backdrop-blur-sm">
          <FaPlus className="group-hover:scale-110 transition-transform" size="16px" />
        </button>
        
        <button className="flex items-center justify-center w-12 h-12 bg-gray-800 bg-opacity-70 text-white rounded-full hover:bg-opacity-90 transition-all duration-200 group backdrop-blur-sm">
          <FaThumbsUp className="group-hover:scale-110 transition-transform" size="16px" />
        </button>
        
        <button className="flex items-center justify-center w-12 h-12 bg-gray-800 bg-opacity-70 text-white rounded-full hover:bg-opacity-90 transition-all duration-200 group backdrop-blur-sm ml-auto">
          <FaVolumeUp className="group-hover:scale-110 transition-transform" size="16px" />
        </button>
      </div>
    </div>
  );
};

export default VideoTitle;
