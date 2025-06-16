import { IoIosArrowDropdown } from "react-icons/io";
import { useDispatch, useSelector } from 'react-redux'
import { setToggle } from '../../redux/movieSlice';
import {  SignedOut, SignInButton, useUser } from '@clerk/clerk-react';
const Header = () => {
    // const user=useSelector((store)=>store.app.user);
    const toggle=useSelector(store=>store.movie.toggle);
    const dispatch=useDispatch()
    const {user}=useUser();
    const toggleHandler=()=>{
        dispatch(setToggle());
    }
    
  return (
    <div className='absolute z-10 flex w-full items-center justify-between px-6 bg-gradient-to-b from-black'>
            <img className='w-56' src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/1198px-Netflix_2015_logo.svg.png" alt="netflix-logo" />
            {
                user && (
                    <div className='flex items-center'>
                        <IoIosArrowDropdown size="24px" color='white' />
                        <h1 className='text-lg font-medium text-white'>{user.fullName}</h1>
                        <div className='ml-4'>
                            <SignedOut>
                              <SignInButton mode="modal">
                                <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors">
                                  Sign In
                                </button>
                              </SignInButton>
                            </SignedOut>
                            <button onClick={toggleHandler} className='bg-red-800 text-white px-4 py-2 ml-2'>{toggle ? "Home" : "Search Movie"}</button>
                        </div>
                    </div>
                )
            }

        </div>
  )
}

export default Header
