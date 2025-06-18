import mongoose,{Schema,Document} from "mongoose"; 
interface UserFeedbackDocument extends Document {
    id: string;
    userId: string;
    recommendationId: string;
    feedback: "liked" | "disliked" | "not_interested";
    reason?: string;
    createdAt: Date;
  }
  
  const UserFeedbackSchema = new Schema<UserFeedbackDocument>(
    {
      id: { type: String, required: true, unique: true },
      userId: { type: String, required: true },
      recommendationId: { type: String, required: true },
      feedback: {
        type: String,
        enum: ["liked", "disliked", "not_interested"],
        required: true,
      },
      reason: { type: String },
      createdAt: { type: Date, default: Date.now },
    },
    { timestamps: false }
  );
  
  const UserFeedback = mongoose.model<UserFeedbackDocument>(
    "UserFeedback",
    UserFeedbackSchema
  );
  
  export default UserFeedback;
  