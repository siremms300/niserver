
import { NextFunction, Request, Response } from "express";
import CourseModel from "../models/courseModel";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";

// create course
export const createCourse = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const course = await CourseModel.create(data)

        res.status(201).json({
            success:true,
            course
        })
    } catch (error:any) {
        return next(new ErrorHandler(error.message, 500))
    }
});
