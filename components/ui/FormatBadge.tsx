import type { EventFields } from "@/database";
import { FORMAT_LABELS } from "@/lib/event-display";

const FORMAT_COLORS: Record<EventFields["mode"], string> = {
    online: "border-format-online bg-format-online",
    "in-person": "border-format-in-person bg-format-in-person",
    hybrid: "border-format-hybrid bg-format-hybrid",
};

type FormatBadgeProps = {
    mode: EventFields["mode"];
    // Sets the size and font, which differ between the card and the event page.
    className?: string;
};

const FormatBadge = ({ mode, className = "px-2.5 py-1.5 font-mono text-xs" }: FormatBadgeProps) => (
    <span className={`whitespace-nowrap rounded-full border font-bold text-on-accent ${FORMAT_COLORS[mode]} ${className}`}>
        {FORMAT_LABELS[mode]}
    </span>
);

export default FormatBadge;
