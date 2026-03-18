import { notFound } from "next/navigation";

import EventContent from "@/components/EventContent";
import BookForm from "@/components/BookForm";
import { EventFields } from "@/database";
import { getSimilarEventsBySlug } from '@/lib/actions/event.actions';
import EventCard from "@/components/EventCard";
import {BookingProvider} from "@/lib/context/booking-context";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
type EventDetails = EventFields & {
  _id: string;
};

const EventDetailsPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
    const { slug } = await params;// unwrap the Promise
    if (!BASE_URL) {
        throw new Error("NEXT_PUBLIC_BASE_URL environment variable is not set");
    }

    const res = await fetch(`${BASE_URL}/api/events/${slug}`);
    if (!res.ok) {
        return notFound();
    }
    const { event } = (await res.json()) as { event: EventDetails };

    if (!event || !event.description || !event.image) return notFound();

   const eventId = event._id;
    if (!eventId) return notFound();

    const similarEvents: EventFields[] = await getSimilarEventsBySlug({ slug });
    return (
        <section id="event">
            {/* Event Header */}
            <div className="header">
                <h1>Event Description</h1>
                <p>{event.description}</p>
            </div>
            {/* Event Details & Booking Form */}
            <div className="details">
                {/* left side - Event Content */}
                <EventContent event={event} />
                {/* Right-side --Booking Form */}
                <BookingProvider value={{eventId, slug: event.slug}}>
                    <BookForm />
                </BookingProvider>
            </div>
            {/* Similar Events */}
            <div className="flex w-full flex-col gap-4 pt-20">
                <h2>Similar Events</h2>
                <div className="events">
                    {similarEvents.length > 0 && similarEvents.map((similarEvents: EventFields) => (
                        <EventCard key={similarEvents.title} {...similarEvents} />
                    ))}
                </div>
            </div>
        </section>
    )
}

export default EventDetailsPage