import mongoose,{Schema,Document} from "mongoose";
interface UserContextDocument extends Document {
    userId: string;
    topGenres: { genre: string; score: number }[];
    watchingPatterns: {
      timeOfDay: string;
      durationPreferences: string;
    };
    contentDiscoveryStyle: "trending" | "niche" | "mixed";
    socialInfluence: number;
    moodPreferences: Record<string, any>;
    lastUpdated: Date;
  }
  
  const UserContextSchema = new Schema<UserContextDocument>(
    {
      userId: { type: String, required: true, unique: true },
      topGenres: [
        {
          genre: { type: String },
          score: { type: Number },
        },
      ],
      watchingPatterns: {
        timeOfDay: { type: String },
        durationPreferences: { type: String },
      },
      contentDiscoveryStyle: {
        type: String,
        enum: ["trending", "niche", "mixed"],
        default: "mixed",
      },
      socialInfluence: { type: Number, default: 0 },
      moodPreferences: { type: Schema.Types.Mixed, default: {} },
      lastUpdated: { type: Date, default: Date.now },
    },
    { timestamps: false }
  );
  
  const UserContext = mongoose.model<UserContextDocument>(
    "UserContext",
    UserContextSchema
  );
  
  export default UserContext;
  