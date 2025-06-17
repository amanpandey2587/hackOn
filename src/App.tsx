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
import Karaoke_Mode from './components/Karaoke_Mode'

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
  //  <div className='relative'>
  //     <Karaoke_Mode />
  //  </div>
  )
}

export default App