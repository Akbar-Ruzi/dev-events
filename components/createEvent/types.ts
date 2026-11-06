import type { EventFields } from "@/database";

export type EventFormValues = Omit<
    EventFields,
    'slug' | 'image' | 'tags' | 'agenda' | 'venue' | 'location'
> & {
    image: File | null;
    tags: string;
    agenda: string;
    venue: string;
    location: string;
};
