import { Request, Response } from 'express';
import { createApplication } from '../services/applicationService';

export const createApplicationController = async (req: Request, res: Response) => {
  const { userId, courseId } = req.body;

  try {
    const application = await createApplication(userId, courseId);
    return res.status(201).json(application);
  } catch (error) {
    return res.status(400);
  }
};
