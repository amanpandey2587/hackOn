import React, { useEffect, useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "./MessageBubble";
import { connectSocket } from "@/utils/server";
import { useAuth, useUser } from "@clerk/clerk-react";
import { ArrowLeft } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { partyService } from "@/services/PartyService";

type Message = {
  _id?: string;
  sender: string;
  senderName?: string;
  text: string;
  timeStamp?: string;
};

type ChatPanelProps = {
  partyId: string;
  partyName: string;
  tags?: string[];
  username: string;
  onLeave: () => void;
  onBack: () => void;
};

export const ChatPanel = ({
  partyName,
  partyId,
  tags,
  username,
  onLeave,
  onBack,
}: ChatPanelProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const { getToken } = useAuth();
  const { user } = useUser();
  const socketRef = useRef<any>(null);

  // --- Tag Editing State ---
  const [editTagsOpen, setEditTagsOpen] = useState(false);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [editingTags, setEditingTags] = useState<string[]>(tags ?? []);
  const [savingTags, setSavingTags] = useState(false);
  const [tagsError, setTagsError] = useState<string | null>(null);

  useEffect(() => {
    if (editTagsOpen) {
      partyService
        .getAllowedTags()
        .then(setAllTags)
        .catch(() => setTagsError("Couldn't fetch allowed tags"));
      setEditingTags(tags ?? []);
    }
  }, [editTagsOpen, tags]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch(
          `http://localhost:4000/api/messages/${partyId}`
        );
        const data = await res.json();
        setMessages(
          data.map(
            (msg: any): Message => ({
              sender: msg.sender,
              senderName: msg.senderName,
              text: msg.content,
              timeStamp: msg.timestamp
                ? new Date(msg.timestamp).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })
                : "",
            })
          )
        );
      } catch (err) {
        console.error("Failed to fetch messages", err);
      }
    };
    fetchMessages();
    let socketInstance: any;
    const setupSocket = async () => {
      const token = await getToken({ template: "socket" });
      if (!token) {
        console.error("No Clerk token available, cannot connect socket.");
        return;
      }
      socketInstance = connectSocket(token);
      socketRef.current = socketInstance;
      socketInstance.emit("joinParty", partyId);
      const receiveHandler = (msg: any) => {
        setMessages((prev) => [
          ...prev,
          {
            sender: msg.sender,
            senderName: msg.senderName,
            text: msg.content,
            timeStamp: msg.timestamp
              ? new Date(msg.timestamp).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })
              : "",
          },
        ]);
      };
      socketInstance.on("receiveMessage", receiveHandler);
      return () => {
        if (socketInstance) {
          socketInstance.off("receiveMessage", receiveHandler);
          socketInstance.disconnect();
        }
      };
    };
    let cleanup: (() => void) | undefined;
    setupSocket().then((fn) => {
      cleanup = fn;
    });
    return () => {
      if (cleanup) cleanup();
    };
  }, [partyId, getToken]);

  const sendMessage = () => {
    if (input.trim()) {
      const emailName = user?.primaryEmailAddress?.emailAddress?.split('@')[0];
      const displayName = user?.fullName || user?.firstName || emailName || username;
      socketRef.current?.emit("sendMessage", {
        partyId,
        sender: username,
        senderName: displayName,
        content: input,
      });
      setInput("");
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Card className="w-96 h-screen border-l shadow-md flex flex-col overflow-hidden">
      <div className="p-3 border-b flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={onBack} className="p-1">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h4 className="font-bold">{partyName}</h4>
            {/* tags are now ONLY shown in dialog/modal */}
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={onLeave}>
            Leave
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setEditTagsOpen(true)}
          >
            View/Edit Tags
          </Button>
        </div>
      </div>
      <ScrollArea className="flex-1 p-3 overflow-y-auto">
        {messages.map((msg, index) => (
          <MessageBubble
            key={index}
            message={msg.text}
            self={msg.sender === username}
            senderName={msg.senderName}
            timestamp={msg.timeStamp || ""}
          />
        ))}
        <div ref={bottomRef} />
      </ScrollArea>
      <div className="border-t p-3 flex gap-2 bg-white">
        <Input
          className="flex-1"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
        />
        <Button onClick={sendMessage}>Send</Button>
      </div>
      <Dialog open={editTagsOpen} onOpenChange={setEditTagsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Tags for Party</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Tags</Label>
            {tagsError && (
              <div className="text-red-500 text-sm">{tagsError}</div>
            )}
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <label
                  key={tag}
                  className="flex items-center gap-1 border px-2 py-1 rounded cursor-pointer text-xs"
                >
                  <input
                    type="checkbox"
                    checked={editingTags.includes(tag)}
                    onChange={() => {
                      setEditingTags((prev) =>
                        prev.includes(tag)
                          ? prev.filter((t) => t !== tag)
                          : [...prev, tag]
                      );
                    }}
                  />
                  {tag}
                </label>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditTagsOpen(false)}
              disabled={savingTags}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                setSavingTags(true);
                try {
                  const toAdd = editingTags.filter((t) => !tags?.includes(t));
                  const toRemove = (tags || []).filter(
                    (t) => !editingTags.includes(t)
                  );
                  if (toAdd.length)
                    await partyService.addPartyTags(partyId, toAdd);
                  if (toRemove.length)
                    await partyService.removePartyTags(partyId, toRemove);
                  setEditTagsOpen(false);
                  // Optionally, refresh tags in parent (smarter way is to update state via a callback)
                  window.location.reload();
                } catch (e) {
                  setTagsError("Failed to update tags");
                } finally {
                  setSavingTags(false);
                }
              }}
              disabled={savingTags}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};