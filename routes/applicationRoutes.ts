import { Router } from 'express';
import { createApplication, updateApplicationStatus } from '../controllers/applicationController';

const applicationRoutes = Router();

applicationRoutes.post('/applications', createApplication);
applicationRoutes.patch('/applications/:id', updateApplicationStatus);

export default applicationRoutes;

