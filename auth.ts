import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import connectDB from "@/lib/mongodb";
import User from "@/database/user.model";

export const { handlers, auth, signIn, signOut } = NextAuth({
    session: { strategy: "jwt" },
    pages: {
        signIn: "/auth/sign-in",
    },
    providers: [
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' }
            },
            async authorize(credentials) {
                const email = credentials?.email;
                const password = credentials?.password;

                if (typeof email !== "string" || typeof password !== "string") {
                    return null;
                }

                await connectDB();

                const user = await User.findOne({ email: email.toLowerCase().trim() });
                if (!user) return null;

                const isPasswordValid = await bcrypt.compare(password, user.password);
                if (!isPasswordValid) return null;

                return {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    role: user.role,
                };
            },

        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id as string;
                token.role = (user as { role?: 'user' | 'admin' }).role ?? 'user';
            }
            return token;
        },

        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = (token.role as "user" | "admin") ?? "user";
            }
            return session;
        },
    },
});