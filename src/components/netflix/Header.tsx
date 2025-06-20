import { IoIosArrowDropdown } from "react-icons/io";
import { useDispatch, useSelector } from 'react-redux';
import { setToggle } from '../../redux/movieSlice';
import { SignedOut, SignInButton, useUser } from '@clerk/clerk-react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { RootState } from "../../redux/store";
import { useChatContext } from "@/utils/ChatContextProvider";
import { Button } from "../ui/button";
const Header = () => {
    const { openChatPanel, closeChatPanel, toggleChatPanel, isChatPanelOpen } = useChatContext();
    const toggle = useSelector((store: RootState) => store.movie.toggle);
    const dispatch = useDispatch();
    const { user } = useUser();
    const navigate = useNavigate();
    const location = useLocation();

    const toggleHandler = () => {
        dispatch(setToggle());
    };

    const goHomeHandler = () => {
        navigate('/');
    };

    const goToSeriesHandler = () => {
        navigate('/netflix/series');
    };

    return (
        <div className='absolute z-10 flex w-full items-center justify-between px-6 bg-gradient-to-b from-black'>
            <img
                className='w-56 cursor-pointer'
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/1198px-Netflix_2015_logo.svg.png"
                alt="netflix-logo"
                onClick={goHomeHandler}
            />
            {user && (
                <div className='flex items-center'>
                    {/* <IoIosArrowDropdown size="24px" color='white' /> */}
                    {/* <h1 className='text-lg font-medium text-white'>{user.fullName}</h1> */}
                    <div className='ml-4 flex space-x-2'>
                        <SignedOut>
                            <SignInButton mode="modal">
                                <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors">
                                    Sign In
                                </button>
                            </SignInButton>
                        </SignedOut>
                        <button
                            onClick={toggleHandler}
                            className='bg-red-800 hover:bg-red-900 text-white px-4 py-2 rounded text-sm font-medium transition-colors'
                        >
                            {toggle ? "Home" : "Search Movie"}
                        </button>
                        <button
                            onClick={goHomeHandler}
                            className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors'
                        >
                            Go to Home
                        </button>
                        <Button onClick={openChatPanel} className="text-white hover:bg-blue-950 bg-blue-800">
                            Open Chat
                        </Button>
                        {location.pathname !== '/series' && (
                            <button
                                onClick={goToSeriesHandler}
                                className='bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors'
                            >
                                Watch Series
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Header;
