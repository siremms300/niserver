import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './userModel';
import { ICourse } from './courseModel';

interface IApplication extends Document {
  user: IUser['_id'];
  course: ICourse['_id'];
  status: string;
}

const ApplicationSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  status: { type: String, required: true, default: 'pending' }
});

const ApplicationModel = mongoose.model<IApplication>('Application', ApplicationSchema);
export default ApplicationModel;
