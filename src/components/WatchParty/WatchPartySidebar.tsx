import { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { WatchPartyCard } from "./WatchPartyCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Lock } from "lucide-react"; 
type Party = {
  _id: string;
  title: string;
  members: string[];
  isPrivate: boolean;
};
type Props = {

  parties: Party[];

  currentUserId: string; // Add this prop

  onJoinParty: (party: Party) => void;

  onLeaveParty: (partyId: string) => void; // Add this prop

  onEnterParty: (party: Party) => void; // Add this for entering already joined parties

  onCreateParty: (data: { title: string; isPrivate: boolean; password?: string }) => Promise<void>;

  loading?: boolean;

  error?: string | null;

};
export const WatchPartySidebar = ({ 

  parties, 

  currentUserId,

  onJoinParty, 

  onLeaveParty,

  onEnterParty,

  onCreateParty,

  loading, 

  error 

}: Props) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newPartyTitle, setNewPartyTitle] = useState("");
  const [newPartyPrivate, setNewPartyPrivate] = useState(false);
  const [newPartyPassword, setNewPartyPassword] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const handleCreateParty = async () => {
    if (!newPartyTitle.trim()) return;
    if (newPartyPrivate && !newPartyPassword.trim()) {
      setCreateError("Password is required for private parties");
      return;
    }
    try {
      setCreating(true);
      setCreateError("");
      await onCreateParty({
        title: newPartyTitle,
        isPrivate: newPartyPrivate,
        password: newPartyPrivate ? newPartyPassword : undefined
      });
      // Reset form and close dialog
      setNewPartyTitle("");
      setNewPartyPrivate(false);
      setNewPartyPassword("");
      setShowCreateDialog(false);
    } catch (error: any) {
      setCreateError(error.message || "Failed to create party");
    } finally {
      setCreating(false);
    }
  };
  return (

    <>

      <Card className="w-80 h-full border-l shadow-md flex flex-col">

        <div className="p-4 border-b flex justify-between items-center">

          <h2 className="text-lg font-bold">Watch Parties</h2>

          <Button 

            size="sm" 

            variant="ghost" 

            onClick={() => setShowCreateDialog(true)}

          >

            New +

          </Button>

        </div>

        <ScrollArea className="p-4 space-y-2 flex-1">

          {loading && (

            <div className="text-center py-4 text-gray-500">Loading parties...</div>

          )}

          {error && (

            <div className="text-center py-4 text-red-500">{error}</div>

          )}

          {!loading && !error && parties.length === 0 && (

            <div className="text-center py-4 text-gray-500">No parties available</div>

          )}

          {!loading && !error && parties.map(p => {

            const isJoined = p.members.some(m => m.userId === currentUserId);

            return (

              <WatchPartyCard 

                key={p._id} 

                {...p} 

                members={p.members.length}

                isJoined={isJoined}

                onJoin={() => isJoined ? onEnterParty(p) : onJoinParty(p)}

                onLeave={isJoined ? () => onLeaveParty(p._id) : undefined}

              />

            );

          })}

        </ScrollArea>

      </Card>
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Watch Party</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Party Name</Label>
              <Input
                id="title"
                value={newPartyTitle}
                onChange={(e) => setNewPartyTitle(e.target.value)}
                placeholder="e.g., Stranger Things Marathon"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="private"
                checked={newPartyPrivate}
                onCheckedChange={(checked) => {
                  setNewPartyPrivate(checked as boolean);
                  if (!checked) setNewPartyPassword(""); // Clear password if unchecked
                }}
              />
              <Label 
                htmlFor="private" 
                className="text-sm font-normal cursor-pointer flex items-center gap-1"
              >
                <Lock className="w-3 h-3" />
                Make this party private
              </Label>
            </div>
            {newPartyPrivate && (
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newPartyPassword}
                  onChange={(e) => setNewPartyPassword(e.target.value)}
                  placeholder="Enter password for private party"
                />
              </div>
            )}
            {createError && (
              <div className="text-sm text-red-500">{createError}</div>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowCreateDialog(false);
                setCreateError("");
              }}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateParty}
              disabled={!newPartyTitle.trim() || creating}
            >
              {creating ? "Creating..." : "Create Party"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};