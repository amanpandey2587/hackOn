import mongoose,{Document,Schema} from "mongoose";
interface WatchHistoryDocument extends Document{
    id:string,
    userId:string;
    contentId:string; //watchmode contetn id
    contentType:"movie"|"tv"|"episode";
    title:string;
    watchedAt:Date;
    watchDuration:number;
    totalDuration:number;
    watchPercentage:number;
    completed:boolean;
    genre:string[];
    rating:number;
    releaseYear:number;
    episodeNumber:number;
    seasonNumber:number;
    streamingService:string;
    createdAt:Date;
    updatedAt:Date;

}

const WatchHistorySchema=new Schema<WatchHistoryDocument>({
    id:{type:String,required:true},
    userId:{type:String,required:true},
    contentId:{type:String,required:true},
    contentType:{
        type:String,
        enum:["movie","tv","episode"],
        required:true,
    },
    title:{type:String,required:true},
    watchedAt:{type:Date,default:Date.now},
    watchDuration:{type:Number,required:true},
    totalDuration:{type:Number,required:true},
    watchPercentage:{type:Number,required:true},
    completed:{type:Boolean,default:false},
    genre:{type:[String],default:[]},
    rating:{type:Number,default:0},
    seasonNumber:{type:Number,default:0},
    episodeNumber:{type:Number,default:0},
    streamingService:{type:String,default:""},
    releaseYear:{type:Number,required:true},
},{timestamps:true})

const WatchHistory=mongoose.model<WatchHistoryDocument>(
    "WatchHistory",WatchHistorySchema
);

export default WatchHistory;