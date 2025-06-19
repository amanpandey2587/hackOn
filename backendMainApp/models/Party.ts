// backendMainApp/models/Party.ts
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
  }
});

export const Party = model<IParty>("Party", PartySchema);