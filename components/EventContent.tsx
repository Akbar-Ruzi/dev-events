import Image from "next/image";
import EventDetailsItem from "@/components/EventDetailsItem";
import EventAgenda from "@/components/EventAgenda";
import EventTags from "@/components/EventTags";
import { EventFields } from "@/database";

type Props = {
    event:EventFields;
}

const EventContent = ({event}: Props) => {
    const { image, overview, date, location, time, mode, audience, agenda, organizer, tags } = event;
    return (
        <div className="content">
            <Image src={image} alt="Event Banner" width={800} height={800} className="banner" />
            <section className="flex-col-gap-2">
                <h2>Overview</h2>
                <p>{overview}</p>
            </section>

            <section className="flex-col-gap-2">
                <h2>Event Details</h2>
                <EventDetailsItem icon="/icons/calendar.svg" alt="calendar" label={date} />
                <EventDetailsItem icon="/icons/clock.svg" alt="clock" label={time} />
                {location && <EventDetailsItem icon="/icons/pin.svg" alt="pin" label={location} />}
                <EventDetailsItem icon="/icons/mode.svg" alt="mode" label={mode} />
                <EventDetailsItem icon="/icons/audience.svg" alt="audience" label={audience} />
            </section>

            {agenda && agenda.length > 0 && <EventAgenda agendaItems={agenda} />}
            <section className="flex-col-gap-2">
                <h2>About the Organizer</h2>
                <p>{organizer}</p>
            </section>
            <EventTags tags={tags ?? []} />
        </div>
    )
}

export default EventContent