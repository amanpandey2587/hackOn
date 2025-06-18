import mongoose from "mongoose";
const UserProfileSchema=new mongoose.Schema({
    userId:{
        type:String,
        required:true,
        unique:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    displayName:{
        type:String,
        required:true,
    },
    avatar:{
        type:String,
    },
    preferences:{
        type:Object,
        default:{},
    }
},  {
    timestamps:true,
}
);

const UserProfile=mongoose.model("UserProfile",UserProfileSchema);

export default UserProfile;