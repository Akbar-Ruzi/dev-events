import Link from "next/link";
import { EventFields } from "@/database";
import DateTile from "@/components/ui/DateTile";
import FormatBadge from "@/components/ui/FormatBadge";
import { getEventPlace } from "@/lib/event-display";

type PropsType = Pick<
    EventFields,
    'title' | 'slug' | 'location' | 'date' | 'time' | 'mode' | 'tags'>;

const EventCard = ({title, slug, location, date, time, mode, tags}: PropsType) => {
    return (
        <Link
            href={`/events/${slug}`}
            className="flex flex-1 flex-col gap-[18px] rounded-2xl border border-line bg-surface p-5"
        >
            <div className="flex items-start justify-between gap-3">
                <DateTile date={date} />
                <FormatBadge mode={mode} />
            </div>
            <div className="flex-1">
                <div className="text-xl font-bold leading-[1.25] tracking-[-0.01em]">{title}</div>
                <div className="mt-2 text-[14px] text-muted">{getEventPlace({mode, location})} · {time}</div>
                {tags && tags.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-2 font-mono text-xs text-muted">
                        {tags.map((tag) => <span key={tag}>#{tag}</span>)}
                    </div>
                )}
            </div>
            <div className="border-t border-line pt-3.5 font-mono text-[13px] text-accent">view event →</div>
        </Link>
    )
}
export default EventCard
