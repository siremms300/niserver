

import { app } from './app';
import connectDB from '../utils/db';
require("dotenv").config();

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB() 
});