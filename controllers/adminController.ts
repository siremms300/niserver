import { Request, Response, NextFunction } from "express";
import adminModel, { IAdmin } from "../models/adminModel";
import ErrorHandler from "../utils/ErrorHandler";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import bcrypt from "bcryptjs";
import ejs from "ejs"
import jwt, { Secret } from "jsonwebtoken";
import path = require("path");
require("dotenv").config();
import userModel, { IUser } from "../models/userModel";
// import sendMail from "../utils/sendMail";


interface IAuthRequest extends Request {
    admin?: any; 
    user?: any; 
}


// Register admin
export const registerAdmin = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, password } = req.body;

        const isEmailExist = await adminModel.findOne({ email });
        if (isEmailExist) {
            return next(new ErrorHandler("Email already exists", 400));
        }

        const admin: Partial<IAdmin> = {
            name,
            email,
            password
        };

        const newAdmin = await adminModel.create(admin);

        const accessToken = newAdmin.SignAccessToken();
        const refreshToken = newAdmin.SignRefreshToken();

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "development",
            sameSite: "strict",
            maxAge: 20 * 60 * 1000 // 15 minutes
        });
      
        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
        //   secure: process.env.NODE_ENV === "production",
          secure: process.env.NODE_ENV === "development",
          sameSite: "strict",
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
    

        res.status(201).json({
            success: true,
            accessToken,
            message: `Admin ${newAdmin.name} registered successfully`
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
});



// Login admin
interface ILoginBody {
    email: string;
    password: string;
}

export const loginAdmin = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body as ILoginBody;

    if (!email || !password) {
        return next(new ErrorHandler("Please enter email and password", 400));
    }

    const admin = await adminModel.findOne({ email }).select("+password");

    if (!admin) {
        return next(new ErrorHandler("Invalid email or password", 401));
    }

    const isPasswordMatched = await bcrypt.compare(password, admin.password);

    if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid email or password", 401));
    }

    const accessToken = admin.SignAccessToken();
    const refreshToken = admin.SignRefreshToken();

    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "development",
        sameSite: "strict",
        maxAge: 20 * 60 * 1000 // 20 minutes
    });

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "development",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(200).json({
        success: true,
        accessToken,
        admin,
        message: "Admin login successful"
    });
});

// Logout admin
export const logoutAdmin = (req: Request, res: Response) => {
    res.cookie("refreshToken", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "development",
        sameSite: "strict",
        expires: new Date(0)
    });

    res.status(200).json({
        success: true,
        message: "Admin logged out successfully"
    });
};




// Get admin profile
export const getAdminProfile = CatchAsyncError(async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const adminId = req.admin._id;

    const admin = await adminModel.findById(adminId).select("-password");

    if (!admin) {
        return next(new ErrorHandler("Admin not found", 404));
    }

    res.status(200).json({
        success: true,
        admin
    });
});




// Receive application from user
export const receiveApplication = CatchAsyncError(async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const { userId, applicationId } = req.body;

    const adminId = req.user._id;

    try {
        const admin = await adminModel.findById(adminId);

        if (!admin) {
            return next(new ErrorHandler("Admin not found", 404));
        }

        // Check if the application already exists in received applications
        const isReceived = admin.receivedApplications.find(app => app.userId.toString() === userId && app.applicationId.toString() === applicationId);
        if (isReceived) {
            return next(new ErrorHandler("Application already received", 400));
        }

        // Add the application to received applications
        admin.receivedApplications.push({ userId, applicationId });
        await admin.save();

        res.status(200).json({
            success: true,
            message: "Application received successfully"
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

// Approve user application
export const approveApplication = CatchAsyncError(async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const { userId, applicationId } = req.body;

    const adminId = req.user._id;

    try {
        const admin = await adminModel.findById(adminId);

        if (!admin) {
            return next(new ErrorHandler("Admin not found", 404));
        }

        // Remove from received applications
        admin.receivedApplications = admin.receivedApplications.filter(app => !(app.userId.toString() === userId && app.applicationId.toString() === applicationId));

        // Add to approved applications
        admin.approvedApplications.push({ userId, applicationId });

        await admin.save();

        // Update user's application status
        const user = await userModel.findByIdAndUpdate(userId, { applicationStatus: "accepted" }, { new: true });

        if (!user) {
            return next(new ErrorHandler("User not found", 404));
        }

        res.status(200).json({
            success: true,
            message: "Application approved successfully"
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

// Reject user application
export const rejectApplication = CatchAsyncError(async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const { userId, applicationId } = req.body;

    const adminId = req.user._id;

    try {
        const admin = await adminModel.findById(adminId);

        if (!admin) {
            return next(new ErrorHandler("Admin not found", 404));
        }

        // Remove from received applications
        admin.receivedApplications = admin.receivedApplications.filter(app => !(app.userId.toString() === userId && app.applicationId.toString() === applicationId));

        // Add to rejected applications
        admin.rejectedApplications.push({ userId, applicationId });

        await admin.save();

        // Update user's application status
        const user = await userModel.findByIdAndUpdate(userId, { applicationStatus: "rejected" }, { new: true });

        if (!user) {
            return next(new ErrorHandler("User not found", 404));
        }

        res.status(200).json({
            success: true,
            message: "Application rejected successfully"
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
});




// Update user cohort
export const updateUserCohort = CatchAsyncError(async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const { userId, cohort } = req.body;

    try {
        const user = await userModel.findById(userId);

        if (!user) {
            return next(new ErrorHandler("User not found", 404));
        }

        user.cohort = cohort;
        await user.save();

        res.status(200).json({
            success: true,
            message: "User cohort updated successfully"
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

// Get all users
export const getAllUsers = CatchAsyncError(async (req: IAuthRequest, res: Response, next: NextFunction) => {
    try {
        const users = await userModel.find();

        res.status(200).json({
            success: true,
            users
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

// Get user by ID
export const getUserById = CatchAsyncError(async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const { userId } = req.params;

    try {
        const user = await userModel.findById(userId);

        if (!user) {
            return next(new ErrorHandler("User not found", 404));
        }

        res.status(200).json({
            success: true,
            user
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

// Delete user by ID
export const deleteUserById = CatchAsyncError(async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const { userId } = req.params;

    try {
        const user = await userModel.findByIdAndDelete(userId);

        if (!user) {
            return next(new ErrorHandler("User not found", 404));
        }

        res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
});
