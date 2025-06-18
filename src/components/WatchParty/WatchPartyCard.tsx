import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type WatchPartyCardProps = {
    title: string
    members: number
    isPrivate: boolean
    onJoin: () => void
}

export const WatchPartyCard = ({title, members, isPrivate, onJoin}: WatchPartyCardProps) => (
  <Card className="p-3 mb-2 flex justify-between items-center">
    <div>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">
        {members} members • {isPrivate ? "Private" : "Public"}
      </p>
    </div>
    <Button size="sm" onClick={onJoin}>
      Join
    </Button>
  </Card>
)