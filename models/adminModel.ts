import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { IUser } from "./userModel";

const emailRegexPattern: RegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export interface IAdmin extends Document {
    name: string;
    email: string;
    password: string;
    role: string;
    receivedApplications: Array<{ userId: string; applicationId: string }>;
    approvedApplications: Array<{ userId: string; applicationId: string }>;
    rejectedApplications: Array<{ userId: string; applicationId: string }>;
    updateUserCohort: (userId: string, cohort: number) => Promise<void>;

    getAllUsers: () => Promise<IUser[]>;
    getUserById: (userId: string) => Promise<IUser | null>;

    SignAccessToken: () => string;
    SignRefreshToken: () => string;
}

const adminSchema: Schema<IAdmin> = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter your name"]
    },
    email: {
        type: String,
        required: [true, "Please enter your correct email"],
        validate: {
            validator: function (value: string) {
                return emailRegexPattern.test(value);
            },
            message: "Please enter a valid email"
        },
        unique: true
    },
    password: {
        type: String,
        required: [true, "Please enter your correct password"],
        minlength: [8, "Password must be at least 8 characters"],
        select: false
    },
    role: {
        type: String,
        default: "admin"
    },
    receivedApplications: [
        {
            userId: { type: Schema.Types.ObjectId, ref: "User" },
            applicationId: Schema.Types.ObjectId
        }
    ],
    approvedApplications: [
        {
            userId: { type: Schema.Types.ObjectId, ref: "User" },
            applicationId: Schema.Types.ObjectId
        }
    ],
    rejectedApplications: [
        {
            userId: { type: Schema.Types.ObjectId, ref: "User" },
            applicationId: Schema.Types.ObjectId
        }
    ]
}, { timestamps: true });


// Method to update user cohort
adminSchema.methods.updateUserCohort = async function (userId: string, cohort: number): Promise<void> {
    const user = await mongoose.model("User").findById(userId);
    if (user) {
        user.cohort = cohort;
        await user.save();
    }
};

// Method to get all users
adminSchema.methods.getAllUsers = async function (): Promise<IUser[]> {
    return await mongoose.model("User").find();
};

// Method to get user by ID
adminSchema.methods.getUserById = async function (userId: string): Promise<IUser | null> {
    return await mongoose.model("User").findById(userId);
};

// Method to delete user by ID
adminSchema.methods.deleteUserById = async function (userId: string): Promise<void> {
    await mongoose.model("User").findByIdAndDelete(userId);
};


// Hash password before saving
adminSchema.pre<IAdmin>('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Sign access token
adminSchema.methods.SignAccessToken = function () {
    return jwt.sign(
        { id: this._id },
        process.env.ACCESS_TOKEN || "",
        { expiresIn: "20m" }
    );
};

// Sign refresh token
adminSchema.methods.SignRefreshToken = function () {
    return jwt.sign(
        { id: this._id },
        process.env.REFRESH_TOKEN || "",
        { expiresIn: "7d" }
    );
};

const adminModel: Model<IAdmin> = mongoose.model("Admin", adminSchema);

export default adminModel;
