import { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { WatchPartyCard } from "./WatchPartyCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Lock } from "lucide-react";
import { partyService } from "../../services/PartyService";
import { Search } from "lucide-react";

// -- TYPES --
type PartyMember = {
  userId: string;
  username: string;
  joinedAt: string;
};
type Party = {
  _id: string;
  title: string;
  members: PartyMember[];
  isPrivate: boolean;
  tags?: string[];
  createdBy?: {
    userId: string;
    username: string;
  };
  createdAt?: string;
};
type Props = {
  parties: Party[];
  currentUserId: string;
  onJoinParty: (party: Party) => void;
  onLeaveParty: (partyId: string) => void;
  onEnterParty: (party: Party) => void;
  onCreateParty: (data: {
    title: string;
    isPrivate: boolean;
    password?: string;
  }) => Promise<Party>;
  loading?: boolean;
  error?: string | null;
  fetchParties: () => Promise<void>; // <--- ADD THIS!
};
export const WatchPartySidebar = ({
  parties,
  currentUserId,
  onJoinParty,
  onLeaveParty,
  onEnterParty,
  onCreateParty,
  loading,
  error,
  fetchParties,
}: Props) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newPartyTitle, setNewPartyTitle] = useState("");
  const [newPartyPrivate, setNewPartyPrivate] = useState(false);
  const [newPartyPassword, setNewPartyPassword] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [newPartyTags, setNewPartyTags] = useState<string[]>([]);
  const [allowedTags, setAllowedTags] = useState<string[]>([]);
  const [tagsError, setTagsError] = useState<string>("");
  // Fetch allowed tags from backend
  useEffect(() => {
    if (showCreateDialog) {
      partyService
        .getAllowedTags()
        .then(setAllowedTags)
        .catch(() => setTagsError("Failed to load tags"));
    }
  }, [showCreateDialog]);
  const handleCreateParty = async () => {
    if (!newPartyTitle.trim()) {
      console.log("Party title missing");
      return;
    }
    if (newPartyPrivate && !newPartyPassword.trim()) {
      setCreateError("Password is required for private parties");
      console.log("Password missing");
      return;
    }
    if (newPartyTags.length === 0) {
      setCreateError("Select at least one tag for the party");
      console.log("No tags selected");
      return;
    }
    try {
      setCreating(true);
      setCreateError("");
      console.log("Creating party with:", {
        title: newPartyTitle,
        isPrivate: newPartyPrivate,
        password: newPartyPrivate ? newPartyPassword : undefined,
      });
      const party = await onCreateParty({
        title: newPartyTitle,
        isPrivate: newPartyPrivate,
        password: newPartyPrivate ? newPartyPassword : undefined,
      });
      console.log("Party creation result:", party);

      // Check for _id
      if (!party._id) {
        console.error("Created party has no _id!", party);
        setCreateError("Server error: no party ID");
        return;
      }

      console.log("Adding tags", newPartyTags, "to party", party._id);
      const tagResult = await partyService.addPartyTags(
        party._id,
        newPartyTags
      );
      console.log("Tag API result:", tagResult);

      await fetchParties?.();
      setNewPartyTitle("");
      setNewPartyPrivate(false);
      setNewPartyPassword("");
      setNewPartyTags([]);
      setShowCreateDialog(false);
    } catch (error: any) {
      setCreateError(error.message || "Failed to create party");
      console.error("Party creation failed:", error);
    } finally {
      setCreating(false);
    }
  };
  const filteredParties = () => {
    return parties.filter((p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
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

        {/* ✅ Search input */}
        <div className="p-4 pt-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search parties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <ScrollArea className="p-4 pt-2 space-y-2 flex-1 overflow-y-auto">
          {loading && (
            <div className="text-center py-4 text-gray-500">
              Loading parties...
            </div>
          )}
          {error && (
            <div className="text-center py-4 text-red-500">{error}</div>
          )}
          {!loading && !error && filteredParties().length === 0 && (
            <div className="text-center py-4 text-gray-500">
              No parties found
            </div>
          )}
          {!loading &&
            !error &&
            filteredParties().map((p) => {
              const isJoined = p.members.some(
                (m) => m.userId === currentUserId
              );
              return (
                <div key={p._id}>
                  <WatchPartyCard
                    {...p}
                    tags={p.tags}
                    members={p.members.length}
                    isJoined={isJoined}
                    onJoin={() => (isJoined ? onEnterParty(p) : onJoinParty(p))}
                    onLeave={isJoined ? () => onLeaveParty(p._id) : undefined}
                  />
                </div>
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
            {/* Party name input, privacy/password, tags, error */}
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
                  if (!checked) setNewPartyPassword("");
                }}
              />
              <Label
                htmlFor="private"
                className="text-sm font-normal flex items-center gap-1"
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
            <div className="grid gap-2">
              <Label>Tags</Label>
              {tagsError && (
                <span className="text-sm text-red-500">{tagsError}</span>
              )}
              {!tagsError && allowedTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {allowedTags.map((tag) => (
                    <label
                      key={tag}
                      className="flex items-center gap-1 border px-2 py-1 rounded cursor-pointer text-xs"
                    >
                      <input
                        type="checkbox"
                        checked={newPartyTags.includes(tag)}
                        onChange={() => {
                          setNewPartyTags((tags) =>
                            tags.includes(tag)
                              ? tags.filter((t) => t !== tag)
                              : [...tags, tag]
                          );
                        }}
                      />
                      {tag}
                    </label>
                  ))}
                </div>
              )}
            </div>
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
                setNewPartyTags([]);
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
