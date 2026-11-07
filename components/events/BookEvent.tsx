'use client';
import { createBooking } from "@/lib/actions/booking.action";
import { useState } from "react";
import { useBookingContext } from "@/lib/context/booking-context";
import posthog from "posthog-js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const BookEvent = () => {
    const {eventId, slug} = useBookingContext();
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const hasError = !!errorMessage;

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (hasError) {
            setErrorMessage('');
        }

        setEmail(e.target.value);
    };

    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMessage('');

        const normalizedEmail = email.trim();
        if (!normalizedEmail) {
            setErrorMessage('Email is required.');
            return;
        }

        if (!EMAIL_REGEX.test(normalizedEmail)) {
            setErrorMessage('Please enter a valid email address.');
            return;
        }

        const result = await createBooking({eventId, slug, email: normalizedEmail});
        const {success} = result;
        if(success) {
            setSubmitted(true);
            posthog.capture('event_booked', {eventId, slug, email});
        } else {
            const responseMessage = result.message;
            setErrorMessage(responseMessage ?? 'Booking creation failed. Please try again.');
            console.error('Booking creation failed:', responseMessage);
            posthog.captureException('Booking creation failed');
        }       
    }
    return (
        <div id="book-event">
            {submitted ? (
                <p className="text-sm">Thank you for signing up!</p>
            ) : (
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={handleEmailChange}
                            id="email"
                            placeholder="Enter your email address"                           
                            aria-invalid={hasError}
                            className={hasError ? 'border border-red-500 ring-2 ring-red-500/40 focus:ring-red-500/60' : ''}
                        />
                    </div>

                    <button
                        type="submit"
                        className="button-submit disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={hasError}
                        aria-disabled={hasError}
                    >
                        Submit
                    </button>
                    {hasError && <p className="text-sm mt-2 text-red-400 font-medium">{errorMessage}</p>}
                </form>
            )}
        </div>
    )
}

export default BookEvent