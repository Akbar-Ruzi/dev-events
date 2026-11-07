import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import connectDB from "@/lib/mongodb";
import User from "@/database/user.model";

type SignupBody = {
    name?: string;
    email?: string;
    password?: string;
    phone?: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
    try {
        const body = (await req.json()) as SignupBody;

        const name = body.name?.trim() ?? "";
        const email = body.email?.trim().toLowerCase() ?? "";
        const password = body.password ?? "";
        const phone = body.phone?.trim() || undefined;

        if (!name || !email || !password) {
            return NextResponse.json(
                { message: "Name, email and password are required" },
                { status: 400 }
            );
        }

        if (name.length < 2 || name.length > 50) {
            return NextResponse.json(
                { message: "Name must be between 2 and 50 characters" },
                { status: 400 }
            );
        }

        if (!EMAIL_REGEX.test(email)) {
            return NextResponse.json(
                { message: "Please provide a valid email address." },
                { status: 400 }
            );
        }

        if (password.length < 8) {
            return NextResponse.json(
                { message: "Password must be at least 8 characters" },
                { status: 400 }
            );
        }

        // bcrypt only uses the first 72 bytes, and characters like emoji take more than one byte,
        // so a password within the character limit can still be too long for bcrypt
        if (password.length > 64 || Buffer.byteLength(password, "utf8") > 72) {
            return NextResponse.json(
                { message: "Password is too long. Please use a shorter one." },
                { status: 400 }
            );
        }

        await connectDB();

        const existingUser = await User.findOne({ email }).lean();
        if (existingUser) {
            return NextResponse.json(
                { message: 'Email already exists' },
                { status: 409 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const createdUser = await User.create({
            name,
            email,
            password: hashedPassword,
            phone, // optional
            role: 'user',
        });

        return NextResponse.json(
            {
                message: 'Account created successfully',
                user: {
                    id: createdUser._id.toString(),
                    name: createdUser.name,
                    email: createdUser.email,
                    phone: createdUser.phone ?? null,
                    role: createdUser.role,
                }
            },
            {status: 201}
        );
    } catch (error) {
        console.error("Signup failed:", error);
        return NextResponse.json(
            {message:"Signup failed. Please try again later."},
            {status: 500}
        );
    }
}