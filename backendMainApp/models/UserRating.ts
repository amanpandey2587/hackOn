import mongoose,{Document,Schema} from "mongoose";
interface UserRatingDocument extends Document{
    id:string;
    userId:string;
    contentId:string;
    rating:number;
    review?:string;
    ratedAt:Date;
    contentType:string;
    genre:string[];
    createdAt:Date;
    updatedAt:Date;
}

const UserRatingSchema=new Schema<UserRatingDocument>({
    id:{type:String,required:true,unique:true},
    userId:{type:String,required:true},
    contentId:{type:String,required:true},
    rating:{type:Number,required:true,min:1,max:10},
    review:{type:String},
    ratedAt:{type:Date,default:Date.now},
    contentType:{type:String,required:true},
    genre:{type:[String],default:[]},
},{timestamps:true})

const UserRating=mongoose.model<UserRatingDocument>(
    "UserRating",UserRatingSchema
);
export default UserRating;