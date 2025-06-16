import React from 'react'
import { useUser, useClerk } from '@clerk/clerk-react'

interface AppLauncherProps {
  onAppSelect: (app: 'netflix' | 'prime' | 'hulu') => void
}

const AppLauncher: React.FC<AppLauncherProps> = ({ onAppSelect }) => {
  const { user } = useUser()
  const { signOut } = useClerk()

  const apps = [
    {
      id: 'netflix' as const,
      name: 'Netflix',
      color: 'bg-red-600',
      hoverColor: 'hover:bg-red-700',
      logo: 'N'
    },
    {
      id: 'prime' as const,
      name: 'Prime Video',
      color: 'bg-blue-600',
      hoverColor: 'hover:bg-blue-700',
      logo: 'P'
    },
    {
      id: 'hulu' as const,
      name: 'Hulu',
      color: 'bg-green-600',
      hoverColor: 'hover:bg-green-700',
      logo: 'H'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      {/* Header with User Info */}
      <div className="flex justify-between items-center p-6">
        <div className="text-white">
          <h1 className="text-3xl font-bold">Fire TV</h1>
          <p className="text-gray-400">Welcome back, {user?.firstName || 'User'}</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* User Avatar */}
          <div className="flex items-center space-x-3">
            <img
              src={user?.imageUrl || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=random`}
              alt="Profile"
              className="w-10 h-10 rounded-full border-2 border-gray-600"
            />
            <span className="text-white font-medium">
              {user?.firstName} {user?.lastName}
            </span>
          </div>
          
          {/* Sign Out Button */}
          <button
            onClick={() => signOut()}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Apps Grid */}
      <div className="flex-1 flex items-center justify-center px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl w-full">
          {apps.map((app) => (
            <button
              key={app.id}
              onClick={() => onAppSelect(app.id)}
              className={`${app.color} ${app.hoverColor} rounded-2xl p-8 text-white transition-all duration-300 transform hover:scale-105 hover:shadow-2xl group`}
            >
              <div className="text-center">
                <div className="text-6xl font-bold mb-4 group-hover:scale-110 transition-transform">
                  {app.logo}
                </div>
                <h2 className="text-2xl font-semibold">{app.name}</h2>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center p-6">
        <p className="text-gray-500">
          Select an app to start streaming
        </p>
      </div>
    </div>
  )
}

export default AppLauncher