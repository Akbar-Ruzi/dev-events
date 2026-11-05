import { Schema, model, models, Document } from "mongoose";

export type UserRole = "admin" | "user";

export interface UserFields {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role: UserRole;
}

export interface IUser extends UserFields, Document {
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            minlength: [2, "Name must be at least 2 characters"],
            maxlength: [50, "Name cannot exceed 50 characters"],
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters"],
        },
        phone: {
            type: String,
            trim: true,
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        }
    },
    { timestamps: true }
);

UserSchema.index({email: 1}, {unique: true});

const User = models.User || model<IUser>("User", UserSchema);

export default User;