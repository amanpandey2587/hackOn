import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMoodEntry {
  emotion: string;
  confidence: number;
  timestamp: Date;
  probabilities: {
    Neutral: number;
    Anger: number;
    Happiness: number;
    Sadness: number;
  };
}

export interface IMoodHistory extends Document {
  userId: string;
  moods: IMoodEntry[];
  aggregatedMoodData: {
    dominantMood: string;
    moodDistribution: Record<string, number>;
    averageConfidence: number;
    lastUpdated: Date;
  };
}

// Define instance methods interface
export interface IMoodHistoryMethods {
  addMood(moodData: Omit<IMoodEntry, 'timestamp'>): Promise<IMoodHistory>;
  updateAggregatedData(): void;
}

// Create the model type that includes both document properties and methods
export type MoodHistoryDocument = IMoodHistory & IMoodHistoryMethods;

// Create the model interface
export interface IMoodHistoryModel extends Model<IMoodHistory, {}, IMoodHistoryMethods> {}

const MoodHistorySchema = new Schema<IMoodHistory, IMoodHistoryModel, IMoodHistoryMethods>({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  moods: [{
    emotion: {
      type: String,
      required: true,
      enum: ['Neutral', 'Anger', 'Happiness', 'Sadness'],
    },
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    probabilities: {
      Neutral: { type: Number, required: true },
      Anger: { type: Number, required: true },
      Happiness: { type: Number, required: true },
      Sadness: { type: Number, required: true },
    }
  }],
  aggregatedMoodData: {
    dominantMood: { type: String },
    moodDistribution: { type: Map, of: Number },
    averageConfidence: { type: Number },
    lastUpdated: { type: Date, default: Date.now },
  }
}, {
  timestamps: true,
});

// Index for efficient queries
MoodHistorySchema.index({ 'moods.timestamp': -1 });

// Method to add a new mood and maintain max 50 entries
MoodHistorySchema.methods.addMood = async function(moodData: Omit<IMoodEntry, 'timestamp'>) {
  this.moods.push({
    ...moodData,
    timestamp: new Date(),
  });

  // Keep only the last 50 moods
  if (this.moods.length > 50) {
    this.moods = this.moods.slice(-50);
  }

  // Update aggregated data
  this.updateAggregatedData();
  
  return this.save();
};

// Method to update aggregated mood data
MoodHistorySchema.methods.updateAggregatedData = function() {
  if (this.moods.length === 0) return;

  const moodCounts: Record<string, number> = {
    Neutral: 0,
    Anger: 0,
    Happiness: 0,
    Sadness: 0,
  };

  let totalConfidence = 0;

  this.moods.forEach((mood: IMoodEntry) => {
    moodCounts[mood.emotion]++;
    totalConfidence += mood.confidence;
  });

  // Calculate mood distribution percentages
  const moodDistribution: Record<string, number> = {};
  Object.keys(moodCounts).forEach(mood => {
    moodDistribution[mood] = (moodCounts[mood] / this.moods.length) * 100;
  });

  // Find dominant mood
  const dominantMood = Object.keys(moodCounts).reduce((a, b) => 
    moodCounts[a] > moodCounts[b] ? a : b
  );

  this.aggregatedMoodData = {
    dominantMood,
    moodDistribution,
    averageConfidence: totalConfidence / this.moods.length,
    lastUpdated: new Date(),
  };
};

const MoodHistory = mongoose.model<IMoodHistory, IMoodHistoryModel>("MoodHistory", MoodHistorySchema);

export default MoodHistory;