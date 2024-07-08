
import express, {Request, Response, NextFunction} from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
require("dotenv").config();
import {ErrorMiddleware} from '../middleware/error'
import userRouter from "../routes/userRoutes";
import adminRouter from "../routes/adminRoutes";
import courseRouter from "../routes/courseRoutes";


export const app = express();

// MIDDLEWARES

// Use morgan middleware with the 'dev' format
app.use(morgan('dev'));

app.use(express.json({limit: "100mb"}))
app.use(cookieParser())
app.use(cors({
    origin: process.env.ORIGIN
}))

app.use(ErrorMiddleware)


// ROUTES
app.use("/api", userRouter)
app.use("/api", adminRouter)
app.use("/api", courseRouter)


// TESING THE API
app.get("/test", (req: Request, res: Response, next:NextFunction)=> {
    res.status(200).json({
        success:true,
        message:"API is working"
    })
})

// FOR UNKNOWN ROUTES 
app.all("*", (req: Request, res: Response, next: NextFunction)=> {
    const err = new Error(`Route ${req.originalUrl} not found`) as any;
    err.statusCode = 404
    next(err)
})
 