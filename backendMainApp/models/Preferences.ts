import mongoose,{Document,Schema} from "mongoose"
interface PreferencesDocument extends Document{
    userId:string;
    preferredGenres:string[];
    preferredLanguages:string[];
    contentTypes:("movie"|"tv"|"documentary")[];
    maturityRating:string;
    watchTimePreferences:"short"|"medium"|"long";
    streamingServices:string[];
    createdAt:Date;
    updatedAt:Date;
}

const PreferencesSchema=new Schema<PreferencesDocument>({
    userId:{type:String,required:true,unique:true},
    preferredGenres:{type:[String],default:[]},
    preferredLanguages:{type:[String],default:[]},
    contentTypes:{
        type:[String],
        enum:["movie","tv","documentary"],
        default:[],
    },
    maturityRating:{type:String,default:""},
    watchTimePreferences:{
        type:String,
        enum:["short","medium","long"],
        default:"medium",
    },
    streamingServices:{type:[String],default:[]},
},{timestamps:true});

const Preferences=mongoose.model<PreferencesDocument>("Preferences",PreferencesSchema);