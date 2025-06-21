// backend/models/WatchHistory.ts
import mongoose from 'mongoose';

const watchHistorySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  contentId: String,
  title: String,
  genre: [String],
  rating: Number,
  completed: Boolean,
  streamingService: String,
  releaseYear: Number,
  watchPercentage: Number,
  watchedAt: Date
}, { timestamps: true });

export default mongoose.model('WatchHistory', watchHistorySchema);
