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
  <Card className="p-3 mb-2 hover:shadow-md transition-shadow">
    <div className="flex justify-between items-center">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">{title}</h3>
          {isPrivate && <Lock className="w-3 h-3 text-gray-500" />}
          {isJoined && <Check className="w-3 h-3 text-green-500" />}
        </div>

        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="bg-blue-100 text-xs px-2 py-0.5 rounded text-blue-800"
              >
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span
                className="bg-gray-200 text-xs px-2 py-0.5 rounded cursor-pointer"
                title={tags.join(", ")}
              >
                +{tags.length - 3} more
              </span>
            )}
          </div>
        )}

        <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
          <Users className="w-3 h-3" />
          <span>{members} members</span>
          {isJoined && <span className="text-green-600 ml-2">• Joined</span>}
        </div>
      </div>
      {isJoined ? (
        <div className="flex gap-2">
          <Button size="sm" variant="default" onClick={onJoin}>
            Enter
          </Button>
          {onLeave && (
            <Button size="sm" variant="outline" onClick={onLeave}>
              Leave
            </Button>
          )}
        </div>
      ) : (
        <Button size="sm" variant="outline" onClick={onJoin}>
          Join
        </Button>
      )}
    </div>
  </Card>
);
