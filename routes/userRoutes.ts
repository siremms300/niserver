// userRoutes

import express from "express";
import { activateUser, registrationuser, loginUser, logoutUser, getUserById, getUserProfile } from "../controllers/userControllers";
import { isAuthenticatedUser } from "../middleware/isAuthenticated";

const userRouter = express.Router();




userRouter.post("/registrations", registrationuser) 
userRouter.post("/activate-user", activateUser) 
userRouter.post("/login", loginUser);
userRouter.post("/logout", logoutUser);
userRouter.get("/registrations/:id",getUserById);




// user profile route
userRouter.get("/user", isAuthenticatedUser, (req, res) => {
    res.status(200).json({
      success: true,
      user: req.user
    });
});

// Get user by ID
userRouter.get("/user/:id", isAuthenticatedUser, getUserById);

userRouter.get("/user", isAuthenticatedUser, getUserProfile);


export default userRouter