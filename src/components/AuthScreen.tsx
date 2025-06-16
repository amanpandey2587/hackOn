import React, { useEffect, useState } from 'react'
import { SignIn, SignUp, useUser } from '@clerk/clerk-react'
import { useDispatch } from 'react-redux'
import { setUser } from '../redux/userSlice' // Adjust path to your actual slice

const AuthScreen: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false)
  const { user, isSignedIn } = useUser()
  const dispatch = useDispatch()

  useEffect(() => {
    if (isSignedIn && user) {
      dispatch(setUser({
        id: user.id,
        email: user.primaryEmailAddress?.emailAddress || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        imageUrl: user.imageUrl || ''
      }))
    }
  }, [isSignedIn, user, dispatch])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 pt-8 pb-12 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-2">Fire TV</h1>
        <p className="text-gray-400 text-lg">Your entertainment hub</p>
      </div>

      {/* Auth Container */}
      <div className="relative z-10 flex justify-center items-center px-4">
        <div className="bg-black bg-opacity-60 backdrop-blur-xl rounded-2xl p-8 w-full max-w-md border border-gray-700">
          {/* Toggle Buttons */}
          <div className="flex mb-6 bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                !isSignUp
                  ? 'bg-white text-black'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                isSignUp
                  ? 'bg-white text-black'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Clerk Auth Components */}
          <div className="clerk-auth-wrapper">
            {isSignUp ? (
              <SignUp
                appearance={{
                  elements: {
                    rootBox: 'w-full',
                    card: 'bg-transparent shadow-none border-none p-0',
                    headerTitle: 'text-white text-xl font-semibold',
                    headerSubtitle: 'text-gray-400',
                    socialButtonsBlockButton: 'border-gray-600 text-white hover:bg-gray-700',
                    formFieldInput: 'bg-gray-800 border-gray-600 text-white',
                    formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
                    footerActionLink: 'text-blue-400 hover:text-blue-300',
                    identityPreviewText: 'text-gray-300',
                    formFieldLabel: 'text-gray-300'
                  }
                }}
              />
            ) : (
              <SignIn
                appearance={{
                  elements: {
                    rootBox: 'w-full',
                    card: 'bg-transparent shadow-none border-none p-0',
                    headerTitle: 'text-white text-xl font-semibold',
                    headerSubtitle: 'text-gray-400',
                    socialButtonsBlockButton: 'border-gray-600 text-white hover:bg-gray-700',
                    formFieldInput: 'bg-gray-800 border-gray-600 text-white',
                    formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
                    footerActionLink: 'text-blue-400 hover:text-blue-300',
                    identityPreviewText: 'text-gray-300',
                    formFieldLabel: 'text-gray-300'
                  }
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 text-center mt-12 pb-8">
        <p className="text-gray-500 text-sm">
          Stream your favorite content from Netflix, Prime Video, Hulu and more
        </p>
      </div>
    </div>
  )
}

export default AuthScreen
