// userController
import { Request, Response, NextFunction } from "express";
import userModel,{IUser} from "../models/userModel";
import ErrorHandler from "../utils/ErrorHandler";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import jwt, { Secret } from "jsonwebtoken";
require("dotenv").config();
import ejs from "ejs"
import nodemailer from "nodemailer"
import path = require("path");
import sendMail from "../utils/sendMail";



// register user 

interface IRegisterBody{
    name:string;
    email:string;
    password:string;
    avatar?:string;
}

export const registrationuser = CatchAsyncError(async(req:Request, res:Response, next:NextFunction)=>{
    try {
        const {name, email, password} = req.body

        const isEmailExist = await userModel.findOne({email})
        if(isEmailExist) {
            return next(new ErrorHandler("Email already exist", 400))
        }

        const user:IRegisterBody = {
            name,
            email,
            password
        }

        const activationToken = createActivationToken(user)

        const activationCode = activationToken.activationCode; 

        const data = {user: {name:user.name}, activationCode} 

        const html = await ejs.renderFile(path.join(__dirname, "../mails/activation-mail.ejs"), data)

        try {
            await sendMail({
                email: user.email,
                subject: "Activate your Account",
                template: "activation-mail.ejs",
                data,
            })
            res.status(201).json({
                success:true,
                message:`Please check your email ${user.email} to activate your account`,
                activationToken:activationToken.token
            })
        } catch (error:any) {
            return new ErrorHandler(error.message,400) 
        }

    } catch (error:any) {
        return next(new ErrorHandler(error.message, 400))
    }
})

interface IActivationToken{
    token:string
    activationCode:string
}

export const createActivationToken = (user: any): IActivationToken => {
    const activationCode = Math.floor(1000 + Math.random() *9000).toString() 
    const token = jwt.sign({
        user, activationCode
    }, process.env.ACTIVATION_SECRET as Secret, {
        expiresIn:"20m"
    });

    return{token,activationCode}
}

// activate user 
interface IActivationRequest{
    activation_token: string;
    activation_code: string;
}

export const activateUser = CatchAsyncError(async(req:Request, res:Response, next:NextFunction)=> {
    try {
        const {activation_token, activation_code} = req.body as IActivationRequest

        const newUser: {user: IUser; activationCode:string} = jwt.verify(
            activation_token,
            process.env.ACTIVATION_SECRET as string
        ) as {user: IUser; activationCode:string};

        if(newUser.activationCode !== activation_code){
            return next(new ErrorHandler("Invalid activation code", 400))
        }

        const{name,email,password} = newUser.user;
        const existUser = await userModel.findOne({email})

        if(existUser) {
            return next(new ErrorHandler("User already exist", 400))
        }

        const user = await userModel.create({
            name,
            email,
            password
        })

        return res.status(201).json({
            success:true,
            message:"Congratulations, your account has been created successfully"
        })

    } catch (error:any) {
        return next(new ErrorHandler(error.message, 400))
    }
})



// Login user 
interface ILoginBody {
    email: string;
    password: string;
}
  
export const loginUser = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body as ILoginBody;
  
    if (!email || !password) {
      return next(new ErrorHandler("Please enter email and password", 400));
    }
  
    const user = await userModel.findOne({ email }).select("+password");
  
    if (!user) {
      return next(new ErrorHandler("Invalid email or password", 401));
    }
  
    const isPasswordMatched = await user.comparePassword(password);
  
    if (!isPasswordMatched) {
      return next(new ErrorHandler("Invalid email or password", 401));
    }
  
    const accessToken = user.SignAccessToken();
    const refreshToken = user.SignRefreshToken();

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

  
    res.status(200).json({
      success: true,
      accessToken,
    //   user,
      message:"Login successful"
    });
  });




// logout user 
export const logoutUser = (req: Request, res: Response) => {
    res.cookie("refreshToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "development",
      sameSite: "strict",
      expires: new Date(0)
    });
  
    res.status(200).json({
      success: true,
      message: "Logged out successfully" 
    });
};
  

export const getUserById = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;
  
    const user = await userModel.findById(userId).select("-password"); // Exclude password from the response
  
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }
  
    res.status(200).json({
      success: true,
      user
    });
});



interface IAuthRequest extends Request {
    user?: any;
}

export const getUserProfile = CatchAsyncError(async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user._id;
  
    const user = await userModel.findById(userId).select("-password"); // Exclude password from the response
  
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }
  
    res.status(200).json({
      success: true,
      user
    });
});