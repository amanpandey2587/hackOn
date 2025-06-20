
import { WatchPartySidebar } from "@/components/WatchParty/WatchPartySidebar";
import { ChatPanel } from "@/components/WatchParty/ChatPanel";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import type {Party} from "../services/PartyService"
import { partyService } from "../services/PartyService";
function ChatPanelImplement() {
    const { user } = useUser();
    const { isSignedIn, isLoaded } = useAuth();
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
    return (
      <div className="flex h-[95%] w-full">
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

export default ChatPanelImplement