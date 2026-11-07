'use server';
import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import Booking from "@/database/booking.model";

type CreateBookingParams = {
    eventId: string;
    slug: string;
    email: string;
    name?: string; // Optional only until the Step 5 booking form sends it
    phone?: string;
}

type CreateBookingResult = {
    success: boolean;
    message?: string;
}

const MAX_NAME_LENGTH = 50;
const MIN_PHONE_DIGITS = 7;
const MAX_PHONE_DIGITS = 15;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[\d\s().-]+$/;

// Server actions can be called directly, so values may not be the strings the types promise
const cleanText = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

const getValidationError = (name: string, email: string, phone: string) => {
    if (!name) return 'Name is required.';
    if (name.length > MAX_NAME_LENGTH) return `Name cannot exceed ${MAX_NAME_LENGTH} characters.`;
    if (!email) return 'Email is required.';
    if (!EMAIL_REGEX.test(email)) return 'Please enter a valid email address.';

    if (phone) {
        const digitCount = phone.replace(/\D/g, '').length;
        if (!PHONE_REGEX.test(phone) || digitCount < MIN_PHONE_DIGITS || digitCount > MAX_PHONE_DIGITS) {
            return 'Please enter a valid phone number.';
        }
    }

    return null;
};

// Bookings hidden with hiddenByUser still count, because those spots were still booked
export const getBookingCount = async (eventId: string) => {
    try {
        await connectDB();
        return await Booking.countDocuments({eventId});
    } catch (e) {
        console.log('Get booking count failed:', e);
        return 0;
    }
};

export const createBooking = async ({eventId, slug: _slug, email, name, phone}: CreateBookingParams) => {
    try {
        const cleanName = cleanText(name);
        const normalizedEmail = cleanText(email).toLowerCase();
        const cleanPhone = cleanText(phone);

        const validationError = getValidationError(cleanName, normalizedEmail, cleanPhone);
        if (validationError) {
            return {success: false, message: validationError} satisfies CreateBookingResult;
        }

        await connectDB();
        const session = await auth();

        await Booking.create({
            eventId,
            userId: session?.user?.id, // Guests have no session, so this stays empty
            name: cleanName,
            email: normalizedEmail,
            phone: cleanPhone || undefined,
        });
        return {success: true} satisfies CreateBookingResult;
    } catch (e) {
        if (typeof e === 'object' && e !== null && 'code' in e && (e as { code?: number }).code === 11000) {
            return {
                success: false,
                message: 'This email is already registered for this event.',
            } satisfies CreateBookingResult;
        }

        console.log('Create booking failed:', e);
        return {success: false, message: 'Unable to create booking right now. Please try again.'} satisfies CreateBookingResult;
    }
}