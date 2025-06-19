import { Request, Response } from 'express';
import UserProfile from '../models/UserProfile'; 
import {validationResult} from 'express-validator'
interface AuthenticatedRequest extends Request {
  auth: {
    userId: string;
  };
}

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.auth.userId;
    const profile = await UserProfile.findOne({ clerkUserId: userId });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "User profile not found"
      });
    }

    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Error fetching user profile: ', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile',
      error: error
    });
  }
};

export const createProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.auth.userId;
    const {email, displayName, avatar, preferences } = req.body;
    const existingProfile = await UserProfile.findOne({ clerkUserId: userId });
    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message: "User profile already exists"
      });
    }
    const newProfile = new UserProfile({
      userId: userId,
      email,
      displayName,
      avatar,
      preferences
    });

    await newProfile.save();

    res.status(201).json({
      success: true,
      data: newProfile
    });
  } catch (error) {
    console.error('Error creating user profile: ', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user profile',
      error: error
    });
  }
};

export const updateProfile=async(req:any,res:any)=>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
          });
        }
        const userId=req.auth.userId;
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
    }catch(error){
        console.error('Error updating user profile ',error)
        res.status(500).json({success:false,message:'Failed to update user profile',error:error});
    }
};

export const deleteProfile=async(req:any,res:any)=>{
    try{
        const userId=req.auth.userId;
        const profile=await UserProfile.findOneAndDelete({userId});
        if(!profile){
            return res.status(404).json({
                success:false,message:'Uesr nnot found'
            })
        }
        res.status(200).json({
            success:true,
            message:'Profile deleted successfully'
        })
    }catch(error){
        console.error('Error deleting user profile: ',error)
        res.status(500).json({
            success:false,message:'Failed to delete user profile',error:error
        })
    }
};

export const updateAvatar=async(req:any,res:any)=>{
    try{
        const userId=req.auth.userId;
        const {avatar}=req.body;
        if(!avatar){
            return res.status(400).json({
                success:false,message:'Avatar URL is required'
            })
        }
        const profile=await UserProfile.findOneAndUpdate(
            {userId},{avatar,updatedAt:new Date()},
            {new:true,upsert:true}
        )
        res.status(200).json({
            success:true,message:"Avatar updates successfully",data:{avatar:profile.avatar}
        })
    }catch(error){
        console.error('Error updaing avatar',error);
        res.status(500).json({success:false,message:'Failed to update avatar',error:error})
    }
}
