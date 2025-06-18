// import  { useState, useEffect } from "react";
// import { BrowserRouter as Router } from "react-router-dom";
// import { useAuth, useUser } from "@clerk/clerk-react";
// import Netflix from "./components/Netflix";
// import Prime from "./components/Prime";
// import Hulu from "./components/Hulu";
// import AppLauncher from "./components/AppLauncher";
// import AuthScreen from "./components/AuthScreen";
// import Karaoke_Mode from "./components/Karaoke_Mode";
// import { WatchPartySidebar } from "./components/WatchParty/WatchPartySidebar";
// import { ChatPanel } from "./components/WatchParty/ChatPanel";



// const dummyParties = [
//   { id: 1, title: "House of the Dragon", members: 12, isPrivate: false },
//   { id: 2, title: "Breaking Bad Rewatch", members: 8, isPrivate: true },
//   { id: 3, title: "Stranger Things Marathon", members: 16, isPrivate: false },
// ];

// function App() {
//   const { user } = useUser(); // 👈 added
//   const { isSignedIn, isLoaded } = useAuth();
//   const [currentApp, setCurrentApp] = useState<
//     "launcher" | "netflix" | "prime" | "hulu"
//   >("launcher");
//   // used for chat parties
//   const [selectedParty, setSelectedParty] = useState<
//     (typeof dummyParties)[0] | null
//   >(null);

//   const renderCurrentApp = () => {
//     switch (currentApp) {
//       case "netflix":
//         return <Netflix />;
//       case "prime":
//         return <Prime />;
//       case "hulu":
//         return <Hulu />;
//       default:
//         return <AppLauncher onAppSelect={setCurrentApp} />;
//     }
//   };

//   if (!isLoaded) {
//     return (
//       <div className="min-h-screen bg-black flex items-center justify-center">
//         <div className="text-white text-xl">Loading...</div>
//       </div>
//     );
//   }

//   if (!isSignedIn) {
//     return <AuthScreen />;
//   }

//   // return (
//   //   // <Router>
//   //   //   <div className='relative'>
//   //   //     {renderCurrentApp()}
//   //   //     {currentApp !== 'launcher' && (
//   //   //       <button
//   //   //         onClick={() => setCurrentApp('launcher')}
//   //   //         className='fixed z-50 top-4 right-72 w-10 h-10 cursor-pointer bg-black bg-opacity-50 rounded-full flex items-center justify-center text-white hover:bg-opacity-70 transition-all duration-200 text-xl font-bold'
//   //   //       >
//   //   //         Back
//   //   //       </button>
//   //   //     )}
//   //   //   </div>
//   //   // </Router>

//   //   <div className="flex h-screen">
//   //     {/* Main OTT area (dummy area created to test side panel)*/}
//   //     <div className="flex-1 bg-zinc-900 text-white flex items-center justify-center">
//   //       <h1 className="text-3xl">OTT Platform Content Area</h1>
//   //     </div>

//   //     {/* Conditional Sidebar */}
//   //     {selectedParty ? (
//   //       <ChatPanel
//   //         partyId={selectedParty.id.toString()}
//   //         partyName={selectedParty.title.toString()}
//   //         username={user?.username || user?.fullName || user?.id || "anonymous"}
//   //         onLeave={() => setSelectedParty(null)}
//   //       />
//   //     ) : (
//   //       <WatchPartySidebar
//   //         parties={dummyParties}
//   //         onJoinParty={(party) => setSelectedParty(party)}
//   //       />
//   //     )}
//   //   </div>
//   //   //  <div className='relative'>
//   //   //     <Karaoke_Mode />
//   //   //  </div>
//   // );

//   // used to test real time chat with clerk authentication
//   return (
//     <div className="flex h-screen">
//       <div className="flex-1 bg-zinc-900 text-white flex items-center justify-center">
//         <h1 className="text-3xl">OTT Platform Content Area</h1>
//       </div>

//       {selectedParty ? (
//         <ChatPanel
//           partyId={selectedParty.id.toString()}
//           partyName={selectedParty.title.toString()}
//           username={user?.username || user?.fullName || user?.id || "anonymous"} // ✅ dynamic
//           onLeave={() => setSelectedParty(null)}
//         />
//       ) : (
//         <WatchPartySidebar
//           parties={dummyParties}
//           onJoinParty={(party) => setSelectedParty(party)}
//         />
//       )}
//     </div>
//   );  
// }

// export default App;



import React from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import Netflix from './components/Netflix'
import Prime from './components/Prime'
import Hulu from './components/Hulu'
import AuthScreen from './components/AuthScreen'
import StreamingShowcase from './components/home/StreamingShowcase'
import Stream from "./components/home/Stream"
import Navbar from './components/Navbar'
import Home from './pages/Home'


const AppContent = () => {
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <div className='relative min-h-screen bg-black'>
      
      <div className='pt-0'>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/netflix" element={<Netflix />} />
          <Route path="/prime" element={<Prime />} />
          <Route path="/hulu" element={<Hulu />} />
        </Routes>
      </div>
    </div>
  )
}

function App() {
  const { isSignedIn, isLoaded } = useAuth()

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (!isSignedIn) {
    return <AuthScreen />
  }

  return (
    <Router>
      <AppContent />
    </Router>
 
  )
}

export default App