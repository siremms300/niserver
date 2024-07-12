import { Router } from 'express';
import { createApplicationController } from '../controllers/applicationController';

const applicationRoute = Router();

// Route to create an application
applicationRoute.post('/create-application', createApplicationController);
applicationRoute.get('/create-application', createApplicationController);

export default applicationRoute;
