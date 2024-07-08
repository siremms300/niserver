
// get user by id 

import { Request, Response, NextFunction } from "express";
import userModel from "../models/userModel";
import ErrorHandler from "../utils/ErrorHandler";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";

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
