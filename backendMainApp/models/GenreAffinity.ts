import mongoose,{Schema,Document} from "mongoose";

interface GenreAffinityDocument extends Document{
    userId:string;
    genre:string;
    affinityScore:number;
    lastUpdated:Date;
    watchCount:number;
    averageRating:number;
    completionRate:number;
}

const GenreAffinitySchema=new Schema<GenreAffinityDocument>({
    userId:{type:String,required:true},
    genre:{type:String,required:true},
    affinityScore:{type:Number,required:true},
    lastUpdated:{type:Date,default:Date.now},
    watchCount:{type:Number,default:0},
    averageRating:{type:Number,default:0},
    completionRate:{type:Number,default:0},
},{timestamps:false});

const GenreAffinity=mongoose.model<GenreAffinityDocument>(
    "GenreAffinity",GenreAffinitySchema
)
export default GenreAffinity;