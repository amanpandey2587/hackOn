import React, { useState } from 'react';
import { Plus, Check, Loader2 } from 'lucide-react';
import { useAuth,useUser } from '@clerk/clerk-react';
interface AddToWatchlistButtonProps {
  contentId: string;
  contentType: 'movie' | 'series' | 'documentary';
  title: string;
  genre?: string[];
  estimatedDuration?: number;
  priority?: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

const AddToWatchlistButton: React.FC<AddToWatchlistButtonProps> = ({
  contentId,
  contentType,
  title,
  genre = [],
  estimatedDuration,
  priority = 3,
  onSuccess,
  onError,
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const addToWatchlist = async () => {
    setIsLoading(true);
    const token=await getToken();
    try {
      const response = await fetch('http://localhost:4000/api/watch-list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          contentId,
          contentType,
          title,
          priority,
          genre,
          estimatedDuration
        })
      });

      const data = await response.json();

      if (data.success) {
        setIsAdded(true);
        onSuccess?.();
        
        // Reset the added state after 2 seconds
        setTimeout(() => {
          setIsAdded(false);
        }, 2000);
      } else {
        throw new Error(data.message || 'Failed to add to watchlist');
      }
    } catch (error: any) {
      console.error('Error adding to watchlist:', error);
      onError?.(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={addToWatchlist}
      disabled={isLoading || isAdded}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
        ${isAdded 
          ? 'bg-green-500 text-white cursor-default' 
          : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg active:scale-95'
        }
        ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isAdded ? (
        <Check className="w-4 h-4" />
      ) : (
        <Plus className="w-4 h-4" />
      )}
      
      {isLoading ? 'Adding...' : isAdded ? 'Added!' : 'Add to Watchlist'}
    </button>
  );
};

export default AddToWatchlistButton;