import clsx from "clsx"

type MessageBubbleProps = {
  message: string
  self?: boolean
  timestamp: string
  senderName?: string
}

export const MessageBubble = ({ message, self = false, timestamp, senderName }: MessageBubbleProps) => (
  <div className={clsx("mb-2", self ? "text-right" : "text-left")}>
    {!self && senderName && (
      <div className="text-xs text-gray-600 mb-1 ml-1">
        {senderName}
      </div>
    )}
    <div className={clsx(
      "inline-block px-4 py-2 rounded-xl max-w-[75%]",
      self ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-900"
    )}>
      <div>{message}</div>
      <div className={clsx(
        "text-xs mt-1 opacity-70",
        self ? "text-white" : "text-gray-700"
      )}>
        {timestamp}
      </div>
    </div>
  </div>
);