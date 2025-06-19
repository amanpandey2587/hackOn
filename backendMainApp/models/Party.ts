import { Schema, model, Document } from "mongoose";
interface IPartyMember {
  userId: string;
  username: string;
  joinedAt: Date;
}
interface IParty extends Document {
  title: string;
  isPrivate: boolean;
  password?: string;
  members: IPartyMember[];
  createdBy: {
    userId: string;
    username: string;
  };
  createdAt: Date;
  tags: string[]; 
}
const PartySchema = new Schema<IParty>({
  title: { 
    type: String, 
    required: true,
    unique: true,
    trim: true
  },
  isPrivate: { 
    type: Boolean, 
    default: false 
  },
  password: { 
    type: String, 
    required: function(this: IParty) { // Explicitly type 'this'
      return this.isPrivate;
    } 
  },
  members: [{
    userId: String,
    username: String,
    joinedAt: { type: Date, default: Date.now }
  }],
  createdBy: {
    userId: String,
    username: String
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  tags: {
    type: [String],
    default: [],
    validate: {
      validator: function(arr: string[]) {
        // No strict validation here, main validation will be in routes (so you can change allowed tags live)
        return Array.isArray(arr) && arr.every(tag => typeof tag === "string");
      },
      message: "tags must be an array of strings"
    }
  }
});
export const Party = model<IParty>("Party", PartySchema);