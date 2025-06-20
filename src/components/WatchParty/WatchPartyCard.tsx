import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Users, Lock, Check } from "lucide-react";

type Props = {
  _id: string;
  title: string;
  members: number;
  isPrivate: boolean;
  isJoined?: boolean;
  tags?: string[];
  onJoin: () => void;
  onLeave?: () => void;
};

export const WatchPartyCard = ({
  title,
  members,
  isPrivate,
  isJoined = false,
  tags = [],
  onJoin,
  onLeave,
}: Props) => (
  <Card className="p-2 mb-4 bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-slate-700 hover:border-blue-500 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-400/50 transition-all duration-300 rounded-xl shadow-xl hover:shadow-2xl hover:shadow-blue-500/20">
    {/* Title row */}
    <div className="flex items-center justify-between gap-3 mb-3">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <h3 className="font-bold text-lg text-white truncate">{title}</h3>
        {isPrivate && (
          <div className="flex-shrink-0 p-1 bg-amber-500/20 rounded-full">
            <Lock className="w-3 h-3 text-amber-400" />
          </div>
        )}
        {isJoined && (
          <div className="flex-shrink-0 p-1 bg-green-500/20 rounded-full">
            <Check className="w-3 h-3 text-green-400" />
          </div>
        )}
      </div>
    </div>

    {/* Tags row */}
    {tags && tags.length > 0 && (
      <div className="flex flex-wrap gap-1.5 mb-3">
        {tags.slice(0, 2).map((tag) => (
          <span
            key={tag}
            className="bg-blue-500/20 text-xs px-2 py-1 rounded-full text-blue-300 font-medium border border-blue-500/30"
          >
            {tag}
          </span>
        ))}
        {tags.length > 2 && (
          <span
            className="bg-slate-700/50 text-xs px-2 py-1 rounded-full cursor-pointer text-slate-300 border border-slate-600 hover:bg-slate-600/50 transition-colors"
            title={tags.join(", ")}
          >
            +{tags.length - 2}
          </span>
        )}
      </div>
    )}

    {/* Members and Action buttons row */}
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <div className="p-1 bg-blue-500/20 rounded">
          <Users className="w-3 h-3 text-blue-400" />
        </div>
        <span className="font-medium text-slate-300 text-sm">{members} members</span>
        {isJoined && (
          <div className="flex items-center gap-1.5 text-green-400 ml-2">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
            <span className="font-medium text-sm">Joined</span>
          </div>
        )}
      </div>
      
      {/* Action buttons */}
      <div className="flex-shrink-0">
        {isJoined ? (
          <div className="flex gap-2">
            <Button 
              size="sm" 
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg shadow-lg hover:shadow-blue-500/30 focus:ring-2 focus:ring-blue-400 transition-all duration-200 text-sm" 
              onClick={onJoin}
            >
              Enter
            </Button>
            {onLeave && (
              <Button 
                size="sm" 
                variant="outline" 
                className="border-2 border-slate-600 text-black hover:border-red-500 hover:text-red-400 hover:bg-red-500/10 font-semibold px-4 py-2 rounded-lg focus:ring-2 focus:ring-red-400 transition-all duration-200 text-sm" 
                onClick={onLeave}
              >
                Leave
              </Button>
            )}
          </div>
        ) : (
          <Button 
            size="sm" 
            variant="outline" 
            className="border-2 border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white font-semibold px-4 py-2 rounded-lg shadow-lg hover:shadow-blue-500/30 focus:ring-2 focus:ring-blue-400 transition-all duration-200 text-sm" 
            onClick={onJoin}
          >
            Join
          </Button>
        )}
      </div>
    </div>
  </Card>
);