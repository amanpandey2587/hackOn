import mongoose,{Document,Schema} from "mongoose";

interface ViewingSessionDocument extends Document{
    id:string;
    userId:string;
    contentId:string;
    sessionStart:Date;
    sessionEnd:Date;
    pauseCount:number;
    seekCount:number;
    deviceType:string;
    watchQuality:string;
    abandoned:boolean;
    createdAt:Date;
    updatedAt:Date;
}

const ViewingSessionSchema=new Schema<ViewingSessionDocument>({
    id:{type:String,required:true,unique:true},
    userId:{type:String,required:true},
    contentId:{type:String,required:true},
    sessionStart:{type:Date,required:true},
    sessionEnd:{type:Date,required:true},
    pauseCount:{type:Number,default:0},
    seekCount:{type:Number,default:0},
    deviceType:{type:String,required:true},
    watchQuality:{type:String,required:true},
    abandoned:{type:Boolean,default:false},
},{timestamps:true});

const ViewingSession=mongoose.model<ViewingSessionDocument>(
    "ViewingSession",ViewingSessionSchema
);

export default ViewingSession;