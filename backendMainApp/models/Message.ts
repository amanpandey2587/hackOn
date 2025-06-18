import {Schema, model} from "mongoose"

const MessageSchema = new Schema({
  partyId: String,
  sender: String,
  content: String,
  timestamp: { type: Date, default: Date.now },
});


export const Message = model("Message", MessageSchema, "messages");
