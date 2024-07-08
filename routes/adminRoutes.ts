// admin routes 

import express from "express";
import {
    loginAdmin,
    registerAdmin,
    logoutAdmin,
    getAdminProfile,
    receiveApplication,
    approveApplication,
    rejectApplication,
    updateUserCohort,
    getAllUsers,
    getUserById,
    deleteUserById
} from "../controllers/adminController";
import { isAuthenticatedAdmin } from "../middleware/isAuthenticated";

const adminRouter = express.Router();

adminRouter.post("/register-admin", registerAdmin);
adminRouter.post("/login-admin", loginAdmin);
adminRouter.post("/logout-admin", logoutAdmin);
adminRouter.get("/admin/profile", isAuthenticatedAdmin, getAdminProfile);
adminRouter.post("/admin/receive-application", isAuthenticatedAdmin, receiveApplication);
adminRouter.post("/admin/approve-application", isAuthenticatedAdmin, approveApplication);
adminRouter.post("/admin/reject-application", isAuthenticatedAdmin, rejectApplication);
adminRouter.put("/admin/update-user-cohort", isAuthenticatedAdmin, updateUserCohort);
adminRouter.get("/admin/get-all-users", isAuthenticatedAdmin, getAllUsers);
adminRouter.get("/admin/get-user-by-id/:userId", isAuthenticatedAdmin, getUserById);
adminRouter.delete("/admin/delete-user-by-id/:userId", isAuthenticatedAdmin, deleteUserById);

export default adminRouter;