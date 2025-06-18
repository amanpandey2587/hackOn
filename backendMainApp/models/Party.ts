import {Schema, model} from "mongoose"

const PartySchema = new Schema({
    title: String,
    isPrivate: Boolean,
    members: [String],
})

export const Party = model("Party", PartySchema)