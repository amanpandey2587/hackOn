import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { WatchPartyCard } from "./WatchPartyCard"

type Party = {
  id: number
  title: string
  members: number
  isPrivate: boolean
}

type Props = {
  parties: Party[]
  onJoinParty: (party: Party) => void
}

export const WatchPartySidebar = ({ parties, onJoinParty }: Props) => (
  <Card className="w-80 h-full border-l shadow-md flex flex-col">
    <div className="p-4 border-b flex justify-between items-center">
      <h2 className="text-lg font-bold">Watch Parties</h2>
      <Button size="sm" variant="ghost">New +</Button>
    </div>
    <ScrollArea className="p-4 space-y-2 flex-1">
      {parties.map(p => (
        <WatchPartyCard key={p.id} {...p} onJoin={() => onJoinParty(p)} />
      ))}
    </ScrollArea>
  </Card>
)
