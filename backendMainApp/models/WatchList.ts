import mongoose,{Document,Schema} from "mongoose";

interface WatchListDocument extends Document{
    id:string;
    userId:string;
    contentId:string;
    contentType:string;
    title:string;
    addedAt:Date;
    priority:number;
    genre:string[];
    estimatedDuration:number;
    createdAt:Date;
    updatedAt:Date;
}

const WatchListSchema=new Schema<WatchListDocument>({
    id:{type:String,required:true,unique:true},
    userId:{type:String,required:true},
    contentId:{type:String,required:true},
    contentType:{type:String,required:true},
    title:{type:String,required:true},
    addedAt:{type:Date,default:Date.now},
    priority:{type:Number,min:1,max:5,default:3},
    genre:{type:[String],default:[]},
    estimatedDuration:{type:Number,required:true},
},{timestamps:true});

const WatchList=mongoose.model<WatchListDocument>(
    "WatchList",WatchListSchema
)

export default WatchList