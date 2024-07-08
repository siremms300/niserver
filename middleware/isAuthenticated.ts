import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import userModel from "../models/userModel";
import adminModel from "../models/adminModel";
import ErrorHandler from "../utils/ErrorHandler";
import { CatchAsyncError } from "./catchAsyncErrors";

interface IAuthRequest extends Request {
    user?: any;
    admin?: any;
}

export const isAuthenticatedUser = CatchAsyncError(async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const { accessToken, refreshToken } = req.cookies;

    if (!accessToken && !refreshToken) {
        return next(new ErrorHandler("You are not logged in", 401));
    }

    try {
        const token = accessToken || refreshToken;
        const decodedData: any = jwt.verify(token, process.env.ACCESS_TOKEN as string || process.env.REFRESH_TOKEN as string);

        const user = await userModel.findById(decodedData.id);
        const admin = await adminModel.findById(decodedData.id);

        if (!user && !admin) {
            return next(new ErrorHandler("User not found", 404));
        }

        req.user = user;
        req.admin = admin;

        next();
    } catch (error) {
        return next(new ErrorHandler("Invalid token", 401));
    }
});





export const isAuthenticatedAdmin = async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const { accessToken } = req.cookies;

    if (!accessToken) {
        return next(new ErrorHandler("Not logged in", 401));
    }

    try {
        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN as string || process.env.REFRESH_TOKEN as string);
        req.admin = await adminModel.findById(decoded.id);
        if (!req.admin) {
            return next(new ErrorHandler("Admin not found", 404));
        }
        next();
    } catch (error) {
        return next(new ErrorHandler("Token is not valid", 401));
    }
};