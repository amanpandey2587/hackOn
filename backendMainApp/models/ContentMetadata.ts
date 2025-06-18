import mongoose,{Schema,Document} from "mongoose";
interface ContentMetadataCacheDocument extends Document {
    contentId: string;
    title: string;
    genre: string[];
    plot: string;
    cast: string[];
    director: string;
    releaseYear: number;
    duration: number;
    rating: number;
    keywords: string[];
    similarContent: string[];
    lastUpdated: Date;
  }
  
  const ContentMetadataCacheSchema = new Schema<ContentMetadataCacheDocument>(
    {
      contentId: { type: String, required: true, unique: true },
      title: { type: String, required: true },
      genre: { type: [String], default: [] },
      plot: { type: String, required: true },
      cast: { type: [String], default: [] },
      director: { type: String },
      releaseYear: { type: Number, required: true },
      duration: { type: Number, required: true },
      rating: { type: Number, default: 0 },
      keywords: { type: [String], default: [] },
      similarContent: { type: [String], default: [] },
      lastUpdated: { type: Date, default: Date.now },
    },
    { timestamps: false }
  );
  
  const ContentMetadataCache = mongoose.model<ContentMetadataCacheDocument>(
    "ContentMetadataCache",
    ContentMetadataCacheSchema
  );
  
  export default ContentMetadataCache;
  