import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { useAuth, useUser } from '@clerk/clerk-react'
import Netflix from './components/Netflix'
import Prime from './components/Prime'
import Hulu from './components/Hulu'
import AppLauncher from './components/AppLauncher'
import AuthScreen from './components/AuthScreen'

function App() {
  const { isSignedIn, isLoaded } = useAuth()
  const [currentApp, setCurrentApp] = useState<'launcher' | 'netflix' | 'prime' | 'hulu'>('launcher')


  const renderCurrentApp = () => {
    switch (currentApp) {
      case 'netflix':
        return <Netflix />
      case 'prime':
        return <Prime />
      case 'hulu':
        return <Hulu />
      default:
        return <AppLauncher onAppSelect={setCurrentApp} />
    }
  }

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
      <div className='relative'>
        {renderCurrentApp()}
        {currentApp !== 'launcher' && (
          <button 
            onClick={() => setCurrentApp('launcher')}
            className='fixed z-50 top-4 right-72 w-10 h-10 cursor-pointer bg-black bg-opacity-50 rounded-full flex items-center justify-center text-white hover:bg-opacity-70 transition-all duration-200 text-xl font-bold'
          >
            Back
          </button>
        )}
      </div>
    </Router>
  )
}

export default App