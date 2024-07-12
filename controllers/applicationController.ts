import { Request, Response } from 'express';
import ApplicationModel from '../models/applicationModel';
import CourseModel from '../models/courseModel';
import UserModel from '../models/userModel';

export const createApplication = async (req: Request, res: Response) => {
  const { userId, courseId } = req.body;
  
  const user = await UserModel.findById(userId);
  const course = await CourseModel.findById(courseId);

  if (!user || !course) {
    return res.status(400).json({ message: 'Invalid user or course' });
  }

  const newApplication = new ApplicationModel({ user: user._id, course: course._id });
  await newApplication.save();

  return res.status(201).json(newApplication);
};

export const updateApplicationStatus = async (req: Request, res: Response) => {
  const { applicationId, status } = req.body;

  const application = await ApplicationModel.findById(applicationId);
  if (!application) {
    return res.status(404).json({ message: 'Application not found' });
  }

  application.status = status;
  await application.save();

  return res.status(200).json(application);
};

