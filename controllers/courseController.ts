
import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import cloudinary from "cloudinary";
import CourseModel from "../models/courseModel";
require("dotenv").config();


// Configure Cloudinary
cloudinary.v2.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_SECRET_KEY,
  });


// upload course 

export const uploadCourse = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = req.body;
        const thumbnail = data.thumbnail;
        if(thumbnail) {
            const myCloud =  await cloudinary.v2.uploader.upload(thumbnail, {
                folder:"courses"
            })

            data.thumbnail = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url
            }
        }


        try {
            const course = await CourseModel.create(data);
    
            res.status(201).json({
                success: true,
                course
            });
        } catch (error: any) {
            return next(new ErrorHandler(error.message, 500));
        }

        // createCourse(data,res,next)

    } catch (error:any) {
        return next(new ErrorHandler(error.message, 500))
    }
});



// Edit course
export const editCourse = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const courseId = req.params.id;
        const data = req.body;

        // Find the course by ID
        const course = await CourseModel.findById(courseId);
        if (!course) {
            return next(new ErrorHandler("Course not found", 404));
        }

        // Handle thumbnail update if provided
        if (data.thumbnail) {
            // Delete the existing thumbnail from Cloudinary
            if (course.thumbnail && course.thumbnail.public_id) {
                await cloudinary.v2.uploader.destroy(course.thumbnail.public_id);
            }

            // Upload the new thumbnail to Cloudinary
            const myCloud = await cloudinary.v2.uploader.upload(data.thumbnail, {
                folder: "courses"
            });

            data.thumbnail = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url
            };
        }

        // Update course details
        const updatedCourse = await CourseModel.findByIdAndUpdate(courseId, data, { new: true });

        res.status(200).json({
            success: true,
            course: updatedCourse
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
});



// Get single course
export const getCourse = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const courseId = req.params.id;
        const course = await CourseModel.findById(courseId);
        if (!course) {
            return next(new ErrorHandler("Course not found", 404));
        }

        res.status(200).json({
            success: true,
            course
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
});


// Get all courses
export const getAllCourses = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const courses = await CourseModel.find();
        res.status(200).json({
            success: true,
            courses
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
}); 