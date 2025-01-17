
import {NextFunction, Request, Response} from "express";
import ErrorHandler from '../utils/ErrorHandler';

export const ErrorMiddleware = (err:any, req:Request, res:Response, next:NextFunction)=> {
    err.statusCode = err.statusCode || 500
    err.message = err.message || "Internal Server Error"

    // wrong mongodb error
    if(err.name === "CastError"){
        const message = `Resource not found. Invalid: ${err.path}`
        err = new ErrorHandler(message, 400)
    }

    // duplicate key error
    if(err.code === 11000) {
        const message = `Duplicate ${Object.keys(err.keyValue)} entered`
        err = new ErrorHandler(message,400)
    }

    // WRONG JWT ERROR
    if(err.code === 'JsonWebTokenError') {
        const message = `JSON web token is invalid, try again`
        err = new ErrorHandler(message,400)
    }

    // EXPIRED JWT ERROR
    if(err.code === 'TokenExpiredError') {
        const message = `JSON web token is expired, try again`
        err = new ErrorHandler(message,400)
    }

    // res.status
    res.status(err.statusCode).json({
        success:false,
        message:err.message
    })
}