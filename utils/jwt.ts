
require("dotenv").config();
import { Response } from "express";
import IUser, { IUser } from "../models/userModel"
import redis from 'redis'


interface ITokenOptions {
    expires: Date,
    maxAge: number,
    httpOnly: boolean,
    sameSite: 'lax' | 'strict' | 'none',
    secure?: boolean
}



export const sendToken = (user:IUser, statusCode:number, res:Response)=> {
    const accessToken = SignAccessToken()
    const refreshToken = signRefreshToken() 

    // upload session to redis 
    redis.set(user._id, JSON.stringify(user) as any)

    // parse environment variable to integrate with fallback values
    const accessTokenExpire = parseInt(process.env.ACCESS_TOKEN_EXPIRE || '1200', 10)
    const refreshTokenExpire = parseInt(process.env.REFRESH_TOKEN_EXPIRE || '10080', 10)

    // opotions for cookies 
    const accessTokenOptions: ITokenOptions = {
        expires: new Date(Date.now() + accessTokenExpire * 1000),
        httpOnly: true,
        //   secure: process.env.NODE_ENV === "production",
        secure: process.env.NODE_ENV === "development",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    }


    const refreshTokenOptions: ITokenOptions = {
        expires: new Date(Date.now() + refreshTokenExpire * 1000),
        httpOnly: true,
        //   secure: process.env.NODE_ENV === "production",
        secure: process.env.NODE_ENV === "development",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    }

    res.cookie("access_token", accessToken, accessTokenOptions)
    res.cookie("refresh_token", refreshToken, refreshTokenOptions) 

    res.status(statusCode).json({
      success: true,
      message:"Login successful"
    })
}
