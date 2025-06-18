import mongoose,{Document,Schema} from "mongoose";

interface ContentInteractionEventDocument extends Document{
    id:string;
    userId:string;
    contentId:string;
    eventType:"view" | "skip"|"bookmark"|"share";
    eventData:Record<string,any>;
    timestamp:Date;
}

const ContentInteractionEventSchema=new Schema<ContentInteractionEventDocument>({
    id:{type:String,required:true,unique:true},
    userId:{type:String,required:true},
    contentId:{type:String,required:true},
    eventType:{
        type:String,
        enum:["view","skip","bookmark","share"],
        required:true,
    },
    eventData:{type:Schema.Types.Mixed,default:{}},
    timestamp:{type:Date,default:Date.now}
},{timestamps:false})

const ContentInteractionEvent=mongoose.model<ContentInteractionEventDocument>(
    "ContentInteractionEvent",
    ContentInteractionEventSchema
);
export default ContentInteractionEvent;