import React, { useEffect, useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { MessageBubble } from "./MessageBubble";
import { connectSocket } from "@/utils/server";
import { useAuth, useUser } from "@clerk/clerk-react";
import { ArrowLeft, LogOut, Tags, Send, Smile, Paperclip, Camera, Mic, Image, FileText, MapPin, Gift } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { partyService } from "@/services/PartyService";

// WhatsApp Input Component (embedded)
const EMOJI_CATEGORIES = {
  "Smileys": ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩", "🥳"],
  "Hearts": ["❤️", "🧡", "💛", "💚", "💙", "💜", "🤎", "🖤", "🤍", "💔", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟"],
  "Gestures": ["👍", "👎", "👌", "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉", "👆", "👇", "☝️", "✋", "🤚", "🖐️", "🖖", "👋", "🤏", "💪", "🦾", "🙏", "👏", "👐"],
  "Animals": ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵", "🙈", "🙉", "🙊", "🐒", "🐔", "🐧", "🐦", "🐤", "🐣", "🐥", "🦆", "🦅", "🦉", "🦇", "🐺", "🐗"],
  "Food": ["🍎", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🍈", "🍒", "🍑", "🥭", "🍍", "🥥", "🥝", "🍅", "🍆", "🥑", "🥦", "🥬", "🥒", "🌶️", "🌽", "🥕", "🧄", "🧅", "🥔", "🍠", "🥐", "🍞", "🥖", "🥨"]
}

type WhatsAppInputProps = {
  value: string
  onChange: (value: string) => void
  onSendMessage: (message: string) => void
  onAttachment?: (type: string, file?: File) => void
  onVoiceRecord?: (isRecording: boolean) => void
  placeholder?: string
  disabled?: boolean
}

const WhatsAppInput = ({ 
  value,
  onChange,
  onSendMessage,
  onAttachment = () => {},
  onVoiceRecord = () => {},
  placeholder = "Type a message...",
  disabled = false
}: WhatsAppInputProps) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showAttachments, setShowAttachments] = useState(false)
  const [selectedEmojiCategory, setSelectedEmojiCategory] = useState("Smileys")
  const [isRecording, setIsRecording] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const sendMessage = () => {
    if (value.trim() && !disabled) {
      onSendMessage(value.trim())
      setShowEmojiPicker(false)
      setShowAttachments(false)
    }
  }

  const addEmoji = (emoji: string) => {
    onChange(value + emoji)
    inputRef.current?.focus()
  }

  const handleAttachment = (type: string) => {
    if (type === "Camera" || type === "Gallery") {
      fileInputRef.current?.click()
    } else {
      onAttachment(type)
    }
    setShowAttachments(false)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onAttachment("File", file)
    }
  }

  const handleVoiceToggle = () => {
    const newRecordingState = !isRecording
    setIsRecording(newRecordingState)
    onVoiceRecord(newRecordingState)
    
    if (newRecordingState) {
      setTimeout(() => {
        setIsRecording(false)
        onVoiceRecord(false)
      }, 3000)
    }
  }

  const attachmentOptions = [
    { icon: Camera, label: "Camera", color: "text-pink-400" },
    { icon: Image, label: "Gallery", color: "text-purple-400" },
    { icon: FileText, label: "Document", color: "text-blue-400" },
    { icon: MapPin, label: "Location", color: "text-green-400" },
    { icon: Gift, label: "Gift", color: "text-yellow-400" }
  ]

  return (
    <div className="relative">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*,video/*"
        onChange={handleFileSelect}
      />

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-full mb-2 left-0 right-0 bg-slate-800/95 backdrop-blur-xl border border-blue-700/50 rounded-2xl p-4 shadow-2xl max-h-64 overflow-hidden">
          <div className="flex gap-2 mb-3 overflow-x-auto">
            {Object.keys(EMOJI_CATEGORIES).map(category => (
              <button
                key={category}
                onClick={() => setSelectedEmojiCategory(category)}
                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  selectedEmojiCategory === category
                    ? "bg-blue-600 text-white"
                    : "bg-slate-700/50 text-blue-300 hover:bg-slate-600/50"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-8 gap-1 max-h-32 overflow-y-auto">
            {EMOJI_CATEGORIES[selectedEmojiCategory as keyof typeof EMOJI_CATEGORIES].map((emoji, index) => (
              <button
                key={index}
                onClick={() => addEmoji(emoji)}
                className="text-lg p-1 rounded hover:bg-blue-600/20 transition-all transform hover:scale-110"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Attachment Options */}
      {showAttachments && (
        <div className="absolute bottom-full mb-2 left-0 right-0 bg-slate-800/95 backdrop-blur-xl border border-blue-700/50 rounded-2xl p-4 shadow-2xl">
          <div className="grid grid-cols-5 gap-3">
            {attachmentOptions.map((option, index) => (
              <button
                key={index}
                className="flex flex-col items-center p-3 rounded-xl bg-slate-700/50 hover:bg-slate-600/50 transition-all transform hover:scale-105"
                onClick={() => handleAttachment(option.label)}
              >
                <option.icon className={`w-6 h-6 mb-1 ${option.color}`} />
                <span className="text-white text-xs">{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Input Area */}
      <div className="flex items-end gap-2 p-3 bg-slate-800/90 backdrop-blur-xl border border-blue-700/50 rounded-2xl shadow-2xl">
        {/* Attachment Button */}
        <button
          onClick={() => {
            setShowAttachments(!showAttachments)
            setShowEmojiPicker(false)
          }}
          className={`p-2 rounded-full transition-all transform hover:scale-110 ${
            showAttachments 
              ? "bg-blue-600 text-white" 
              : "bg-slate-700/50 text-blue-300 hover:bg-slate-600/50"
          }`}
        >
          <Paperclip className="w-4 h-4" />
        </button>

        {/* Input Field */}
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                sendMessage()
              }
            }}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full bg-transparent text-white placeholder:text-blue-300/70 resize-none outline-none text-sm leading-relaxed min-h-[20px] max-h-24"
            rows={1}
            style={{
              height: 'auto',
              minHeight: '20px'
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement
              target.style.height = 'auto'
              target.style.height = target.scrollHeight + 'px'
            }}
          />
        </div>

        {/* Emoji Button */}
        <button
          onClick={() => {
            setShowEmojiPicker(!showEmojiPicker)
            setShowAttachments(false)
          }}
          className={`p-2 rounded-full transition-all transform hover:scale-110 ${
            showEmojiPicker 
              ? "bg-blue-600 text-white" 
              : "bg-slate-700/50 text-blue-300 hover:bg-slate-600/50"
          }`}
        >
          <Smile className="w-4 h-4" />
        </button>

        {/* Voice/Send Button */}
        {value.trim() ? (
          <button
            onClick={sendMessage}
            disabled={disabled}
            className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-all transform hover:scale-110 shadow-lg hover:shadow-blue-500/25 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleVoiceToggle}
            className={`p-2 rounded-full transition-all transform hover:scale-110 ${
              isRecording
                ? "bg-red-600 text-white animate-pulse"
                : "bg-slate-700/50 text-blue-300 hover:bg-slate-600/50"
            }`}
          >
            <Mic className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Recording Indicator */}
      {isRecording && (
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-medium animate-pulse">
          🎤 Recording...
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex gap-2 justify-center mt-2">
        <button 
          className="px-3 py-1 bg-slate-700/50 hover:bg-slate-600/50 text-blue-300 rounded-full text-xs transition-all"
          onClick={() => onChange("👋 Hey there!")}
        >
          👋 Hey!
        </button>
        <button 
          className="px-3 py-1 bg-slate-700/50 hover:bg-slate-600/50 text-blue-300 rounded-full text-xs transition-all"
          onClick={() => onChange("👍 Sounds good")}
        >
          👍 Good
        </button>
        <button 
          className="px-3 py-1 bg-slate-700/50 hover:bg-slate-600/50 text-blue-300 rounded-full text-xs transition-all"
          onClick={() => onChange("😂 LOL")}
        >
          😂 LOL
        </button>
      </div>
    </div>
  )
}

// Main ChatPanel types
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

  const sendMessage = (messageText: string) => {
    if (messageText.trim()) {
      const emailName = user?.primaryEmailAddress?.emailAddress?.split('@')[0];
      const displayName = user?.fullName || user?.firstName || emailName || username;
      socketRef.current?.emit("sendMessage", {
        partyId,
        sender: username,
        senderName: displayName,
        content: messageText,
      });
      setInput("");
    }
  };

  const handleAttachment = (type: string, file?: File) => {
    console.log(`Attachment: ${type}`, file);
    // Handle file uploads here
    if (file) {
      // You can implement file upload logic here
      // For now, just send a message about the attachment
      sendMessage(`📎 Shared a ${type.toLowerCase()}: ${file.name}`);
    } else {
      sendMessage(`📎 ${type} attachment`);
    }
  };

  const handleVoiceRecord = (isRecording: boolean) => {
    console.log(`Voice recording: ${isRecording ? 'started' : 'stopped'}`);
    if (!isRecording) {
      // Simulate voice message
      sendMessage("🎤 Voice message");
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      <Card className="w-full h-[100%] border-none shadow-  from-slate-900 to-slate-800 border-2 border-slate-700 text-white flex flex-col overflow-hidden bg-gradient-to-b  backdrop-blur-xl border-l ">
        {/* Header with glassmorphic effect */}
        <div className="p-4 border-b bg-gradient-to-r  from-slate-900 to-slate-800 border-2 border-slate-700 text-white backdrop-blur-lg">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={onBack} 
                className="p-2 hover:bg-blue-800/50 text-blue-300 hover:text-white rounded-full transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h4 className="font-bold text-white text-lg tracking-wide">{partyName}</h4>
                <p className="text-blue-300 text-xs">Watch Party Chat</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setEditTagsOpen(true)}
                className="p-2 hover:bg-blue-800/50 text-blue-300 hover:text-white rounded-lg transition-all duration-200"
                title="View/Edit Tags"
              >
                <Tags className="w-4 h-4" />
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={onLeave}
                className="p-2 hover:bg-red-800/50 text-blue-300 hover:text-red-300 rounded-lg transition-all duration-200"
                title="Leave Party"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-3">
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
          </div>
        </ScrollArea>

        {/* WhatsApp-Style Input Area */}
        <div className="border-t border-blue-800/30 p-4 bg-gradient-to-r from-blue-950/80 to-blue-900/80 backdrop-blur-lg">
          <WhatsAppInput
            value={input}
            onChange={setInput}
            onSendMessage={sendMessage}
            onAttachment={handleAttachment}
            onVoiceRecord={handleVoiceRecord}
            placeholder="Type a message..."
          />
        </div>
      </Card>

      <Dialog open={editTagsOpen} onOpenChange={setEditTagsOpen}>
        <DialogContent className="bg-gradient-to-b from-blue-950 to-blue-900 border border-blue-800/50 text-white backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <Tags className="w-5 h-5 text-blue-400" />
              Edit Party Tags
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Label className="text-blue-300 font-medium">Available Tags</Label>
            {tagsError && (
              <div className="text-red-400 text-sm bg-red-900/20 p-2 rounded-lg border border-red-800/30">
                {tagsError}
              </div>
            )}
            <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto">
              {allTags.map((tag) => (
                <label
                  key={tag}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm transition-all duration-200 ${
                    editingTags.includes(tag)
                      ? 'bg-blue-700/50 border border-blue-500 text-white'
                      : 'bg-blue-900/30 border border-blue-800/50 text-blue-300 hover:bg-blue-800/40 hover:text-white'
                  }`}
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
                    className="w-4 h-4 text-blue-500 bg-blue-900/50 border-blue-700 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  {tag}
                </label>
              ))}
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setEditTagsOpen(false)}
              disabled={savingTags}
              className="bg-transparent border-blue-700 text-blue-300 hover:bg-blue-800/50 hover:text-white"
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
              className="bg-blue-700 hover:bg-blue-600 text-white"
            >
              {savingTags ? "Saving..." : "Save Tags"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};