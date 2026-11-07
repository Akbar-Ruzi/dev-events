import type { EventFields } from "@/database";

export const FORMAT_LABELS: Record<EventFields["mode"], string> = {
    online: "Online",
    "in-person": "In person",
    hybrid: "Hybrid",
};

// Event dates are stored as YYYY-MM-DD, so they're read in UTC to stop the day shifting by timezone.
export function getDateParts(date: string) {
    const parsed = new Date(`${date}T00:00:00Z`);
    if (isNaN(parsed.getTime())) {
        return { month: "---", day: "--", weekday: "---" };
    }

    const format = (options: Intl.DateTimeFormatOptions) =>
        new Intl.DateTimeFormat("en-US", { timeZone: "UTC", ...options }).format(parsed);

    return {
        month: format({ month: "short" }).toUpperCase(),
        day: format({ day: "2-digit" }),
        weekday: format({ weekday: "short" }).toUpperCase(),
    };
}

export function getEventPlace({ mode, location }: Pick<EventFields, "mode" | "location">) {
    return mode === "online" ? "Online" : location ?? "";
}
