// frontend/components/ResultPanel.tsx
import { motion } from 'framer-motion';

interface Props {
  selectedTitle: string | null;
  loading: boolean;
  error: string | null;
  spinning: boolean;
  onLike: () => void;
  onRespin: () => void;
}

export default function ResultPanel({ selectedTitle, loading, error, spinning, onLike, onRespin }: Props) {
  // Don't show the panel if there's no selected title and not spinning and no error
  if (!selectedTitle && !spinning && !error) {
    return null;
  }

  return (
    <motion.div
      className="w-full max-w-md p-6 bg-black/60 backdrop-blur-md rounded-xl shadow-2xl text-center space-y-4 border border-gray-700/50"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {error && (
        <motion.div 
          className="text-red-400 text-sm p-3 bg-red-900/20 rounded-lg border border-red-700"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          ❌ {error}
        </motion.div>
      )}
      
      {spinning && (
        <motion.div 
          className="text-indigo-300 text-lg font-semibold space-y-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="animate-pulse">🎰 Spinning the wheel...</div>
          <div className="text-sm text-gray-400">
            The wheel is choosing your perfect match!
          </div>
        </motion.div>
      )}
      
      {!spinning && selectedTitle && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-4"
        >
          <div className="text-center space-y-3">
            <motion.div 
              className="text-sm text-gray-400 uppercase tracking-wide font-semibold"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              🎬 Your Perfect Match
            </motion.div>
            <motion.h2 
              className="text-2xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent leading-tight"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              "{selectedTitle}"
            </motion.h2>
            <motion.div 
              className="text-xs text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              ✨ Personally selected just for you
            </motion.div>
          </div>
          
          <motion.div 
            className="flex justify-center gap-4 mt-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <motion.button 
              onClick={onLike}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 border border-green-400/20"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              👍 Perfect Choice!
            </motion.button>
            <motion.button 
              onClick={onRespin}
              className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 border border-yellow-400/20"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              🔄 Try Another
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}