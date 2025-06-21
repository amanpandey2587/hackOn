import { useState, useEffect } from "react";
// Removed: import { Button, Card, Progress, Badge } from "@/components/ui/..."

import { Users, Clock, TrendingUp } from "lucide-react";
import { toast } from "sonner"; // Assuming sonner is set up

interface LivePollProps {
  question: string;
  options: string[];
}

export default function LivePoll({ question, options }: LivePollProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  
  const [votes, setVotes] = useState<Record<string, number>>(() => {
    const initialVotes: Record<string, number> = {};
    options.forEach(option => {
      initialVotes[option] = Math.floor(Math.random() * 30) + 10; // Random initial votes
    });
    return initialVotes;
  });

  const totalVotes = Object.values(votes).reduce((sum, count) => sum + count, 0);

  const handleVote = () => {
    if (selectedOption && !hasVoted) {
      setVotes(prev => ({
        ...prev,
        [selectedOption]: prev[selectedOption as keyof typeof prev] + 1
      }));
      setHasVoted(true);
      toast.success("Vote submitted successfully!");
    }
  };

  const getPercentage = (option: string) => {
    const voteCount = votes[option as keyof typeof votes];
    return totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
  };

  useEffect(() => {
      setHasVoted(false);
      setSelectedOption(null);
      setVotes(() => {
          const initialVotes: Record<string, number> = {};
          options.forEach(option => {
              initialVotes[option] = Math.floor(Math.random() * 30) + 10;
          });
          return initialVotes;
      });
  }, [options]);


  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
          <Users className="w-4 h-4 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white">Live Poll</h1>
      </div>

      {/* Replaced Card with div and applied equivalent styling */}
      <div className="p-8 bg-gray-800 border border-gray-700 shadow-lg rounded-lg">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            {/* Replaced Badge (secondary variant) with span and applied equivalent styling */}
            <span className="inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-purple-900 text-purple-300">
              <Clock className="w-3 h-3 mr-1" />
              Live Poll
            </span>
            {/* Replaced Badge (outline variant) with span and applied equivalent styling */}
            <span className="inline-flex items-center rounded-full border border-pink-700 px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-pink-400">
              <Users className="w-3 h-3 mr-1" />
              {totalVotes + (hasVoted && selectedOption ? 1 : 0)} votes
            </span>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">
            {question}
          </h2>
        </div>

        <div className="space-y-4 mb-6">
          {options.map((option) => (
            <div
              key={option}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                selectedOption === option
                  ? 'border-purple-500 bg-purple-900/30'
                  : 'border-gray-600 hover:border-purple-500 hover:bg-gray-700'
              } ${hasVoted ? 'cursor-default' : ''}`}
              onClick={() => !hasVoted && setSelectedOption(option)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-white">{option}</span>
                {hasVoted && (
                  <span className="text-sm font-bold text-purple-400">
                    {getPercentage(option)}%
                  </span>
                )}
              </div>

              {hasVoted && (
                <div className="relative">
                  {/* Replaced Progress with div and inner div for fill */}
                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-700">
                      <div
                          className="h-full bg-purple-500 transition-all duration-500"
                          style={{ width: `${getPercentage(option)}%` }}
                      ></div>
                  </div>
                  <div className="mt-1 text-xs text-gray-400">
                    {votes[option as keyof typeof votes]} votes
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Replaced Button with native button element */}
        {!hasVoted ? (
          <button
            onClick={handleVote}
            disabled={!selectedOption}
            // Manually added typical ShadCN button base classes + gradient
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            Submit Vote
          </button>
        ) : (
          <div className="text-center">
            <div className="text-green-400 font-medium mb-2">✓ Thank you for voting!</div>
            {/* Replaced Button (outline variant) with native button element */}
          </div>
        )}
      </div>
    </div>
  );
}