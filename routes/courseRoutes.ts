// userRoutes

import express from "express";
import { uploadCourse, editCourse, getCourse, getAllCourses } from "../controllers/courseController";
import { isAuthenticatedAdmin } from "../middleware/isAuthenticated";

const courseRouter = express.Router();



courseRouter.post("/admin/upload-course", isAuthenticatedAdmin, uploadCourse) 

// Get user by ID
courseRouter.get("/admin/upload-course", uploadCourse);
courseRouter.put("/admin/edit-course/:id", isAuthenticatedAdmin, editCourse);
courseRouter.get("/course/:id", getCourse);
courseRouter.get("/courses", getAllCourses);



export default courseRouter
