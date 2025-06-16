import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/clerk-react';
import { useEffect } from 'react';

const Login: React.FC = () => {
  const { isSignedIn, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
    //   navigate('/browse');
    }
  }, [isSignedIn, isLoaded]);

  return (
    // <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/70 to-transparent hover:bg-black/90 transition-all duration-300 px-4 md:px-16">
    //   <nav className="flex items-center justify-between h-16 md:h-20 max-w-screen-2xl mx-auto">
        
    //     {/* Netflix Logo */}
    //     <div className="flex-shrink-0">
    //       <Link 
    //         to="/" 
    //         className="text-red-600 text-2xl md:text-3xl font-bold hover:text-red-500 transition-colors"
    //       >
    //         NETFLIX
    //       </Link>
    //     </div>

    //     {/* Navigation Links - Only show when signed in */}
    //     {/* <SignedIn>
    //       <div className="hidden md:flex items-center space-x-6 ml-10">
    //         <Link 
    //           to="/browse" 
    //           className="text-white text-sm font-medium hover:text-gray-300 transition-colors relative group"
    //         >
    //           Home
    //           <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
    //         </Link>
    //         <Link 
    //           to="/movies" 
    //           className="text-white text-sm font-medium hover:text-gray-300 transition-colors relative group"
    //         >
    //           Movies
    //           <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
    //         </Link>
    //         <Link 
    //           to="/tv-shows" 
    //           className="text-white text-sm font-medium hover:text-gray-300 transition-colors relative group"
    //         >
    //           TV Shows
    //           <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
    //         </Link>
    //         <Link 
    //           to="/my-list" 
    //           className="text-white text-sm font-medium hover:text-gray-300 transition-colors relative group"
    //         >
    //           My List
    //           <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
    //         </Link>
    //       </div>
    //     </SignedIn> */}

    //     {/* Authentication Section */}
    //     <div className="flex items-center space-x-4">
    //       <SignedOut>
    //         <SignInButton mode="modal">
    //           <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors">
    //             Sign In
    //           </button>
    //         </SignInButton>
    //       </SignedOut>
          
    //       <SignedIn>
    //         <div className="flex items-center space-x-4">
    //           {/* Search Icon */}
    //           <button 
    //             className="text-white hover:text-gray-300 transition-colors"
    //             onClick={() => {/* Handle search */}}
    //           >
    //             <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    //               <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
    //             </svg>
    //           </button>
              
    //           {/* Notifications */}
    //           <button 
    //             className="text-white hover:text-gray-300 transition-colors"
    //             onClick={() => {/* Handle notifications */}}
    //           >
    //             <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    //               <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
    //             </svg>
    //           </button>

    //           {/* User Button */}
    //           <UserButton 
    //             appearance={{
    //               elements: {
    //                 avatarBox: "w-8 h-8 rounded",
    //                 userButtonPopoverCard: "bg-black border border-gray-600",
    //                 userButtonPopoverActions: "text-white",
    //                 userButtonPopoverActionButton: "text-white hover:bg-gray-800",
    //                 userButtonPopoverFooter: "hidden"
    //               }
    //             }}
    //             userProfileMode="modal"
    //             afterSignOutUrl="/"
    //           />
    //         </div>
    //       </SignedIn>
    //     </div>
    //   </nav>

    //   <SignedIn>
    //     <div className="md:hidden bg-black/90 border-t border-gray-800">
    //       <div className="flex justify-around py-2">
    //         <Link 
    //           to="/browse" 
    //           className="text-white text-xs font-medium py-2 px-3 hover:text-gray-300 transition-colors"
    //         >
    //           Home
    //         </Link>
    //         <Link 
    //           to="/movies" 
    //           className="text-white text-xs font-medium py-2 px-3 hover:text-gray-300 transition-colors"
    //         >
    //           Movies
    //         </Link>
    //         <Link 
    //           to="/tv-shows" 
    //           className="text-white text-xs font-medium py-2 px-3 hover:text-gray-300 transition-colors"
    //         >
    //           TV Shows
    //         </Link>
    //         <Link 
    //           to="/my-list" 
    //           className="text-white text-xs font-medium py-2 px-3 hover:text-gray-300 transition-colors"
    //         >
    //           My List
    //         </Link>
    //       </div>
    //     </div>
    //   </SignedIn>
    // </header>
    <header>
    <SignedOut>
      <SignInButton />
    </SignedOut>
    <SignedIn>
      <UserButton />
    </SignedIn>
  </header>
  );

};

export default Login;