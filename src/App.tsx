import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useAuth, useUser } from '@clerk/clerk-react';
import Netflix from './components/Netflix';
import Prime from './components/Prime';
import Hulu from './components/Hulu';
import AuthScreen from './components/AuthScreen';
import Home from './pages/Home';
import { useEffect, useState } from 'react';
import axios from 'axios';

const AppContent = () => {
  const location = useLocation();
  
  return (
    <div className="relative min-h-screen bg-black">
      <div className="pt-0">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/netflix" element={<Netflix />} />
          <Route path="/prime" element={<Prime />} />
          <Route path="/hulu" element={<Hulu />} />
        </Routes>
      </div>
    </div>
  );
};

function App() {
  const { isSignedIn, isLoaded, getToken } = useAuth(); // 👈 Move getToken to top level
  const { user } = useUser();
  console.log('user is ',user);
  const [profileChecked, setProfileChecked] = useState(false);

  useEffect(() => {
    const syncUserProfile = async () => {
      try {
        const token = await getToken(); // 👈 Now using getToken from top level
        
        const response = await axios.get('http://localhost:4000/api/user-profiles/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log('✅ User profile exists:', response.data);
        setProfileChecked(true); // profile already exists, done
      } catch (error: any) {
        if (error.response && error.response.status === 404) {
          console.log('⚠️ No profile found — creating one...');
          
          // 2️⃣ No profile → create new one
          try {
            const token = await getToken(); // 👈 Get token again for the POST request
            await axios.post(
              'http://localhost:4000/api/user-profiles/profile',
              {
                email:user?.emailAddresses[0].emailAddress,
                displayName: user?.fullName || '',
                avatar: user?.imageUrl || '',
                preferences: {}
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              }
            );
            
            console.log('✅ User profile created');
          } catch (createError) {
            console.error('❌ Failed to create user profile:', createError);
          }
        } else {
          console.error('❌ Error checking profile:', error);
        }
      } finally {
        setProfileChecked(true); // done checking
      }
    };

    // Run only if user is signed in and profile is not yet checked
    if (isSignedIn && user?.id && !profileChecked) {
      syncUserProfile();
    }
  }, [isSignedIn, user, profileChecked, getToken]); // 👈 Add getToken to dependencies

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isSignedIn) {
    return <AuthScreen />;
  }

  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;