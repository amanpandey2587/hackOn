const UserProfile=require('../models/UserProfile')
const {validationResult}=require('express-validator')

exports.getProfile=async(req:any,res:any)=>{
    try{
        const userId=req.user.id;
        const profile=await UserProfile.findOne({userId});
        if(!profile){
            return res.status(404).json({
                success:false,
                message:"User profile not found"
            })
        }
        res.status(200).json({
            success:true,
            data:profile
        });
    }catch(error){
        console.error('Error fetching user profile: ',error);
        res.status(500).json({
            success:false,
            message:'Failed to fetch user profile',
            error:error
        })
    }
}

exports.createProfile=async(req:any,res:any)=>{
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({
            success:false,message:'validation errors',errors:errors.array()
        })
    }
    try{
        const userId=req.user.id;
        const existingProfile=await UserProfile.findOne({userId})
        if(existingProfile){
            return res.status(400).json({
                success:false,message:"User profile already exists"
            })
        }
        const {displayName,avatar,preferences}=req.body
        const newProfile=new UserProfile({
            userId,
            email:req.user.email,
            displayName,
            avatar,preferences
        });
        await newProfile.save();
        res.status(201).json({
            success:true,message:'User profile create successfully',data:newProfile
        });
    }catch(error){
        console.error('Error fetching user profile: ',error);
        res.status(500).json({
            success:false,message:'Failed to create user profile ',error:error
        })
    }
}

exports.updateProfile=async(req:any,res:any)=>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
          });
        }
        const userId=req.user.id;
        const updateData={...req.body};
        delete updateData.userId;
        delete updateData.createdAt;

        updateData.updatedAt=new Date()
        
        const profile=await UserProfile.findOneAndUpdate(
            {userId},updateData,{new:true,runValidators:true}
        );

        res.status(200).json({
            success:true,
            message:'Profile updated successfully',
            data:profile
        });
    }
}