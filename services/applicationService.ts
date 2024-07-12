import applicationModel from '../models/applicationModel';
import courseModel from '../models/courseModel';
import userModel from '../models/userModel';

export const createApplication = async (userId: string, courseId: string) => {
  // Check if user exists
  const user = await userModel.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Check if course exists
  const course = await courseModel.findById(courseId);
  if (!course) {
    throw new Error('Course not found');
  }

  // Create a new application
  const application = new applicationModel({ user: userId, course: courseId });
  await application.save();

  return application;
};
