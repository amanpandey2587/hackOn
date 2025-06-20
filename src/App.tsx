import AppLauncher from "./components/AppLauncher";
import Karaoke_Mode from "./components/Karaoke_Mode";
import { WatchPartySidebar } from "./components/WatchParty/WatchPartySidebar";
import { ChatPanel } from "./components/WatchParty/ChatPanel";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { useAuth, useUser } from "@clerk/clerk-react";
import Netflix from "./components/Netflix";
import Prime from "./components/Prime";
import Hulu from "./components/Hulu";
import AuthScreen from "./components/AuthScreen";
import Home from "./pages/Home";
import { useEffect, useState } from "react";
import axios from "axios";
import { partyService } from "./services/PartyService";
import type { Party } from "./services/PartyService";
import BrowseSeries from "./components/netflix/BrowseSeries";
import { ChatProvider } from "./utils/ChatContextProvider";
import GlobalChatPanel from "./services/ChatPanelGlobal";
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
          <Route path="/netflix/series" element={<BrowseSeries/>} />
        </Routes>
        <GlobalChatPanel/>
      </div>
    </div>
  );
};

function App() {
  const { isSignedIn, isLoaded, getToken } = useAuth(); // 👈 Move getToken to top level
  const { user } = useUser();
  console.log("user is ", user);
  const [profileChecked, setProfileChecked] = useState(false);

  useEffect(() => {
    const syncUserProfile = async () => {
      try {
        const token = await getToken(); // 👈 Now using getToken from top level

        const response = await axios.get(
          "http://localhost:4000/api/user-profiles/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("✅ User profile exists:", response.data);
        setProfileChecked(true); // profile already exists, done
      } catch (error: any) {
        if (error.response && error.response.status === 404) {
          console.log("⚠️ No profile found — creating one...");

          // 2️⃣ No profile → create new one
          try {
            const token = await getToken(); // 👈 Get token again for the POST request
            await axios.post(
              "http://localhost:4000/api/user-profiles/profile",
              {
                email: user?.emailAddresses[0].emailAddress,
                displayName: user?.fullName || "",
                avatar: user?.imageUrl || "",
                preferences: {},
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            console.log("✅ User profile created");
          } catch (createError) {
            console.error("❌ Failed to create user profile:", createError);
          }
        } else {
          console.error("❌ Error checking profile:", error);
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
    <ChatProvider>
    <Router>
      <AppContent />
    </Router>
    </ChatProvider>
  );
}

function ChatPanelImplement() {
  const { user } = useUser();
  const { isSignedIn, isLoaded } = useAuth();
  const [currentApp, setCurrentApp] = useState<
    "launcher" | "netflix" | "prime" | "hulu"
  >("launcher");
  // Party state management
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedParty, setSelectedParty] = useState<Party | null>(null);
  // Fetch parties from MongoDB
  const fetchParties = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await partyService.getParties();
      setParties(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch parties");
      console.error("Error fetching parties:", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (isSignedIn) {
      fetchParties();
      // Optional: Set up polling to refresh parties every 30 seconds
      const interval = setInterval(fetchParties, 30000);
      return () => clearInterval(interval);
    }
  }, [isSignedIn]);
  // Handle joining a party (NEW FUNCTION - ADD THIS)
  const handleJoinParty = async (party: Party) => {
    try {
      // Check if already a member
      const isAlreadyMember = party.members.some(
        (m) => m.userId === (user?.id || "anonymous")
      );
      if (isAlreadyMember) {
        // Already a member, just open the chat
        setSelectedParty(party);
        return;
      }
      // If it's a private party, we need to get the password
      if (party.isPrivate) {
        // For now, let's use a simple prompt. You can replace with a proper dialog later
        const password = window.prompt(
          "This is a private party. Enter password:"
        );
        if (!password) return;
        // Try to join with password
        const updatedParty = await partyService.joinParty(party._id, {
          userId: user?.id || "anonymous",
          username:
            user?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
            user?.id ||
            "anonymous",
          password,
        });
        // Update the party in the list with new member info
        setParties((prev) =>
          prev.map((p) => (p._id === updatedParty._id ? updatedParty : p))
        );
        setSelectedParty(updatedParty);
      } else {
        // Public party - join directly
        const updatedParty = await partyService.joinParty(party._id, {
          userId: user?.id || "anonymous",
          username: user?.username || user?.fullName || "Anonymous",
        });
        // Update the party in the list with new member info
        setParties((prev) =>
          prev.map((p) => (p._id === updatedParty._id ? updatedParty : p))
        );
        setSelectedParty(updatedParty);
      }
    } catch (error: any) {
      alert(error.message || "Failed to join party");
    }
  };
  // Handle leaving a party (NEW FUNCTION - ADD THIS)
  const handleLeaveParty = async () => {
    if (!selectedParty) return;
    try {
      // Call the leave endpoint
      await partyService.leaveParty(selectedParty._id, user?.id || "anonymous");
      // Refresh parties list to get updated member counts
      await fetchParties();
      // Clear selected party
      setSelectedParty(null);
    } catch (error) {
      console.error("Failed to leave party:", error);
      setSelectedParty(null);
    }
  };
  // Add this function to handle leaving without entering chat
  const handleLeavePartyFromSidebar = async (partyId: string) => {
    try {
      await partyService.leaveParty(partyId, user?.id || "anonymous");
      await fetchParties();
    } catch (error) {
      console.error("Failed to leave party:", error);
      alert("Failed to leave party");
    }
  };
  // Add this function to handle entering an already joined party
  const handleEnterParty = (party: Party) => {
    setSelectedParty(party);
  };
  // Add this function to handle going back to sidebar
  const handleBackToSidebar = () => {
    setSelectedParty(null);
  };
  // KEEP YOUR EXISTING handleCreateParty function as is
const handleCreateParty = async (data: {
  title: string;
  isPrivate: boolean;
  password?: string;
}) => {
  const newParty = await partyService.createParty({
    ...data,
    userId: user?.id || "anonymous",
    username: user?.username || user?.fullName || "Anonymous",
  });
  await fetchParties();
  return newParty;
};


  const renderCurrentApp = () => {
    switch (currentApp) {
      case "netflix":
        return <Netflix />;
      case "prime":
        return <Prime />;
      case "hulu":
        return <Hulu />;
      default:
        return <AppLauncher onAppSelect={setCurrentApp} />;
    }
  };
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
    <div className="flex h-screen">
      <div className="flex-1 bg-zinc-900 text-white flex items-center justify-center">
        <h1 className="text-3xl">OTT Platform Content Area</h1>
      </div>
      {selectedParty ? (
        <ChatPanel
          partyId={selectedParty._id}
          partyName={selectedParty.title}
          tags={selectedParty.tags} // <-- HERE
          username={user?.username || user?.fullName || user?.id || "anonymous"}
          onLeave={handleLeaveParty}
          onBack={handleBackToSidebar}
        />
      ) : (
<WatchPartySidebar
  parties={parties}
  currentUserId={user?.id || "anonymous"}
  onJoinParty={handleJoinParty}
  onLeaveParty={handleLeavePartyFromSidebar}
  onEnterParty={handleEnterParty}
  onCreateParty={handleCreateParty}
  loading={loading}
  error={error}
  fetchParties={fetchParties} // <--- ADD THIS!
/>
      )}
    </div>
  );
}

export default App;
