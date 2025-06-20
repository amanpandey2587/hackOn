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
import { Lock, Search, Plus } from "lucide-react";
import { partyService } from "../../services/PartyService";

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
  fetchParties: () => Promise<void>;
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
      <Card className="w-full h-full bg-gradient-to-b from-slate-950 to-slate-900 border-2 border-slate-700 shadow-2xl flex flex-col">
        <div className="p-6 border-b-2 border-slate-700 bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Watch Parties</h2>
            <Button
              size="lg"
              className="bg-white/20 hover:bg-white/30 text-white border border-white/30 hover:border-white/50 backdrop-blur-sm font-semibold px-4 py-2 rounded-lg focus:ring-2 focus:ring-white/50 transition-all duration-200"
              onClick={() => setShowCreateDialog(true)}
            >
              <Plus className="w-5 h-5 mr-2" />
              New
            </Button>
          </div>
        </div>

        {/* Search input */}
        <div className="p-6 pb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search parties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-3 text-lg bg-slate-800 border-2 border-slate-600 text-white placeholder-slate-400 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all duration-200"
            />
          </div>
        </div>

        <ScrollArea className="p-6 pt-2 flex-1 overflow-y-auto">
          {loading && (
            <div className="text-center py-8 text-slate-400">
              <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-lg">Loading parties...</p>
            </div>
          )}
          {error && (
            <div className="text-center py-8">
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
                <p className="text-red-400 font-medium">{error}</p>
              </div>
            </div>
          )}
          {!loading && !error && filteredParties().length === 0 && (
            <div className="text-center py-8">
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                <p className="text-slate-400 text-lg">No parties found</p>
                <p className="text-slate-500 text-sm mt-2">Try creating a new one!</p>
              </div>
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
        <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">Create New Watch Party</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-6">
            {/* Party name input */}
            <div className="grid gap-3">
              <Label htmlFor="title" className="text-lg font-semibold text-slate-200">Party Name</Label>
              <Input
                id="title"
                value={newPartyTitle}
                onChange={(e) => setNewPartyTitle(e.target.value)}
                placeholder="e.g., Stranger Things Marathon"
                className="py-3 px-4 text-lg bg-slate-800 border-2 border-slate-600 text-white placeholder-slate-400 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
              />
            </div>

            {/* Privacy checkbox */}
            <div className="flex items-center space-x-3 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <Checkbox
                id="private"
                checked={newPartyPrivate}
                onCheckedChange={(checked) => {
                  setNewPartyPrivate(checked as boolean);
                  if (!checked) setNewPartyPassword("");
                }}
                className="w-5 h-5"
              />
              <Label
                htmlFor="private"
                className="text-lg font-medium flex items-center gap-2 cursor-pointer text-slate-200"
              >
                <Lock className="w-5 h-5 text-amber-400" />
                Make this party private
              </Label>
            </div>

            {/* Password field */}
            {newPartyPrivate && (
              <div className="grid gap-3">
                <Label htmlFor="password" className="text-lg font-semibold text-slate-200">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newPartyPassword}
                  onChange={(e) => setNewPartyPassword(e.target.value)}
                  placeholder="Enter password for private party"
                  className="py-3 px-4 text-lg bg-slate-800 border-2 border-slate-600 text-white placeholder-slate-400 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
            )}

            {/* Tags section */}
            <div className="grid gap-3">
              <Label className="text-lg font-semibold text-slate-200">Tags</Label>
              {tagsError && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
                  <span className="text-red-400 font-medium">{tagsError}</span>
                </div>
              )}
              {!tagsError && allowedTags.length > 0 && (
                <div className="flex flex-wrap gap-3 p-4 bg-slate-800/50 rounded-lg border border-slate-700 max-h-40 overflow-y-auto">
                  {allowedTags.map((tag) => (
                    <label
                      key={tag}
                      className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg cursor-pointer text-sm font-medium transition-colors border border-slate-600 hover:border-blue-500"
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
                        className="w-4 h-4 text-blue-500 bg-slate-700 border-slate-500 rounded focus:ring-blue-500"
                      />
                      <span className="text-slate-200">{tag}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Error message */}
            {createError && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
                <div className="text-red-400 font-medium">{createError}</div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                setCreateError("");
                setNewPartyTags([]);
              }}
              disabled={creating}
              className="px-6 py-3 text-lg font-semibold border-2 border-slate-600 text-slate-300 hover:border-slate-500 hover:bg-slate-700 rounded-lg focus:ring-2 focus:ring-slate-400 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateParty}
              disabled={!newPartyTitle.trim() || creating}
              className="px-6 py-3 text-lg font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-lg hover:shadow-blue-500/30 focus:ring-2 focus:ring-blue-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Creating...
                </div>
              ) : (
                "Create Party"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};