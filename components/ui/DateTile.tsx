import { getDateParts } from "@/lib/event-display";

const DateTile = ({ date }: { date: string }) => {
    const { month, day, weekday } = getDateParts(date);

    return (
        <div className="w-16 flex-none rounded-[12px] border border-border bg-bg py-2 text-center font-mono">
            <div className="text-[11px] text-accent">{month}</div>
            <div className="text-[26px] font-medium leading-[1.2]">{day}</div>
            <div className="text-[10px] text-muted">{weekday}</div>
        </div>
    );
};

export default DateTile;
