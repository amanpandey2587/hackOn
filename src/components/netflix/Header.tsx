import { IoIosArrowDropdown } from "react-icons/io";
import { useDispatch, useSelector } from 'react-redux';
import { setToggle } from '../../redux/movieSlice';
import { SignedOut, SignInButton, useUser } from '@clerk/clerk-react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { RootState } from "../../redux/store";
import { useChatContext } from "@/utils/ChatContextProvider";
import NetflixSearch from "../Search/NetflixSearch";
import NetflixStreamer from "../Search/NetflixStreamer";
import Netbar from "../Search/Netbar";
import { useState } from "react";
const Header = () => {
    const { openChatPanel } = useChatContext();
    const toggle = useSelector((store: RootState) => store.movie.toggle);
    const dispatch = useDispatch();
    const { user } = useUser();
    const navigate = useNavigate();
    const location = useLocation();

    const [voiceQuery, setVoiceQuery] = useState(''); 

  const handleTranscription = (transcription: string) => {
    setVoiceQuery(transcription);
  };
    const goHomeHandler = () => {
        navigate('/');
        window.scrollTo(0, 0);
    };

    const goToSeriesHandler = () => {
        navigate('/netflix/series');
        window.scrollTo(0, 0);
    };

    const goToMoviesHandler = () => {
        navigate('/netflix');
        window.scrollTo(0, 0);
    };

    return (
        <div className='absolute z-10 flex w-full items-center justify-between px-8 py-4 bg-gradient-to-b from-black/90 to-black/50'>
            {/* Left section: Logo + Search */}
            <div className="flex items-center space-x-6">
                {/* Netflix Logo */}
                <img
                    className='w-32 md:w-44 cursor-pointer'
                    src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg"
                    alt="Netflix Logo"
                    onClick={goHomeHandler}
                />

                {/* SearchBar */}
                <div className="flex items-center space-x-3">
                <NetflixStreamer onTranscriptionReceived={handleTranscription} />
                <div className={'flex-1  w-full'}>
                  <NetflixSearch voiceQuery={voiceQuery} key={voiceQuery || 'default'} />
                </div>
              </div>
            </div>

            {/* Right Section */}
            {user && (
                <div className='flex items-center space-x-4'>
                    <SignedOut>
                        <SignInButton mode="modal">
                            <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors">
                                Sign In
                            </button>
                        </SignInButton>
                    </SignedOut>

                    <button
                        onClick={goHomeHandler}
                        className='bg-transparent border border-white/50 hover:border-white text-white px-4 py-2 rounded text-sm font-medium transition-colors'
                    >
                        Home
                    </button>

                    <button
                        onClick={goToMoviesHandler}
                        className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                            location.pathname === '/netflix'
                                ? 'bg-red-800 text-white'
                                : 'bg-red-700 hover:bg-red-800 text-white'
                        }`}
                    >
                        Movies
                    </button>

                    <button
                        onClick={openChatPanel}
                        className='bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded text-sm font-medium transition-colors'
                    >
                        Chat
                    </button>

                    {location.pathname !== '/series' && (
                        <button
                            onClick={goToSeriesHandler}
                            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                                location.pathname === '/netflix/series'
                                    ? 'bg-red-800 text-white'
                                    : 'bg-red-700 hover:bg-red-800 text-white'
                            }`}
                        >
                            Series
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default Header;
