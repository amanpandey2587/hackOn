import clsx from "clsx"
import { useState } from "react"

type MessageBubbleProps = {
  message: string
  self?: boolean
  timestamp: string
  senderName?: string
}

export const MessageBubble = ({ message, self = false, timestamp, senderName }: MessageBubbleProps) => {
  const [isFocused, setIsFocused] = useState(false)
  console.log("Sender name for the message props is",senderName )
  return (
    <div
      className={clsx(
        "flex w-full mb-4 px-4 transition-all duration-300 ease-out",
        self ? "justify-end" : "justify-start"
      )}
      tabIndex={0}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    >
      <div
        className={clsx(
          "relative max-w-2xl transform transition-all duration-300 ease-out",
          "backdrop-blur-xl border border-white/20 rounded-2xl",
          "shadow-2xl shadow-slate-900/30",
          isFocused && "scale-105 shadow-3xl shadow-blue-400/40",
          self 
            ? "bg-gradient-to-br from-blue-600/80 via-blue-700/70 to-blue-800/80" 
            : "bg-gradient-to-br from-slate-800/80 via-slate-700/70 to-slate-900/80"
        )}
      >
        {/* Glassmorphic overlay */}
        <div className="absolute inset-0 bg-white/5 rounded-2xl" />
        
        {/* Glow effect for focus */}
        {isFocused && (
          <div className={clsx(
            "absolute -inset-1 rounded-2xl blur-sm opacity-75",
            self 
              ? "bg-gradient-to-r from-blue-400 to-cyan-400" 
              : "bg-gradient-to-r from-blue-300 to-indigo-300"
          )} />
        )}
        
        <div className="relative p-6">
          { senderName && (
            <div className="mb-3">
              <span className="text-blue-300 text-lg font-semibold tracking-wide">
                {senderName}
              </span>
            </div>
          )}
          
          <div className="mb-4">
            <p className="text-white text-xl leading-relaxed font-medium">
              {message}
            </p>
          </div>
          
          <div className={clsx(
            "flex",
            self ? "justify-start" : "justify-end"
          )}>
            <span className="text-blue-200/80 text-base font-normal tracking-wide">
              {timestamp}
            </span>
          </div>
        </div>
        
        {/* Shimmer effect */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden">
          <div className={clsx(
            "absolute -inset-full opacity-20",
            "bg-gradient-to-r from-transparent via-white/20 to-transparent",
            "animate-pulse duration-2000"
          )} />
        </div>
      </div>
    </div>
  )
}