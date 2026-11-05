'use client';
import { useRef, useState } from "react";
import toast from 'react-hot-toast';

import TextInputField from './TextInputField';
import TextareaField from './TextareaField'
import type { EventFormValues } from './types';
import { useNavbarLock } from '@/lib/context/navbar-lock-context';

const initialValues: EventFormValues = {
    title: '',
    description: '',
    overview: '',
    venue: '',
    location: '',
    date: '',
    time: '',
    mode: 'online',
    audience: '',
    organizer: '',
    tags: '',
    agenda: '',
    image: null,
}
type FieldErrors = Partial<Record<keyof EventFormValues, string>>;

const CreateEventForm = () => {
    const { setIsNavbarDisabled } = useNavbarLock();
    const imageInputRef = useRef<HTMLInputElement | null>(null);
    const [formValues, setFormValues] = useState<EventFormValues>(initialValues);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});


    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const name = e.target.name as keyof EventFormValues;
        const value = e.target.value;
        // Update the form state
        setFormValues((prev) => ({
            ...prev,
            [name]: value
        }));
        // Clear the error for that field if it had one
        if (fieldErrors[name]) {
            setFieldErrors((prev) => ({
                ...prev,
                [name]: ''
            }));
        }
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setFormValues((prev) => ({ ...prev, image: file }));
        if (fieldErrors.image) {
            setFieldErrors((prev) => ({ ...prev, image: '' }));
        }
    }

    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();

        const form = e.currentTarget;
        const imageInput = form.elements.namedItem('image') as HTMLInputElement | null;
        const selectedImage = formValues.image ?? imageInput?.files?.[0] ?? null;

        const errors: FieldErrors = {};
        if (!formValues.title.trim()) errors.title = 'Title is required.';
        if (!formValues.description.trim()) errors.description = 'Description is required.';
        if (!formValues.overview.trim()) errors.overview = 'Overview is required.';
        if (!selectedImage) errors.image = 'Image is required.';
        if (!formValues.venue.trim()) errors.venue = 'Venue is required.';
        if (!formValues.organizer.trim()) errors.organizer = 'Organizer is required.';
        if (!formValues.location.trim()) errors.location = 'Location is required.';
        if (!formValues.date) errors.date = 'Date is required.';
        if (!formValues.time) errors.time = 'Time is required.';
        if (!formValues.audience.trim()) errors.audience = 'Audience is required.';
        if (!formValues.tags.trim()) errors.tags = 'Tags are required.';
        if (!formValues.agenda.trim()) errors.agenda = 'Agenda is required.';

        // Returns an array of error's keys. If there are any errors, set them in state and return early. 
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }
        setFieldErrors({});

        const parsedTags = formValues.tags
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean);

        const parsedAgenda = formValues.agenda
            .split('\n')
            .map((item) => item.trim())
            .filter(Boolean);

        if (parsedTags.length === 0) {
            setFieldErrors((prev) => ({ ...prev, tags: 'At least one tag is required.' }));
            return;
        }

        if (parsedAgenda.length === 0) {
            setFieldErrors((prev) => ({ ...prev, agenda: 'At least one agenda item is required.' }));
            return;
        }

        setIsSubmitting(true);
        setIsNavbarDisabled(true);
        const toastId = toast.loading('Creating event...');
        try {
            const payload = new FormData();
            payload.append('title', formValues.title.trim());
            payload.append('description', formValues.description.trim());
            payload.append('overview', formValues.overview.trim());
            payload.append('venue', formValues.venue.trim());
            payload.append('location', formValues.location.trim());
            payload.append('date', formValues.date);
            payload.append('time', formValues.time);
            payload.append('mode', formValues.mode);
            payload.append('audience', formValues.audience.trim());
            payload.append('organizer', formValues.organizer.trim());
            payload.append('tags', JSON.stringify(parsedTags));
            payload.append('agenda', JSON.stringify(parsedAgenda));

            if (selectedImage) {
                payload.append('image', selectedImage);
            }

            const res = await fetch('/api/events', {
                method: 'POST',
                body: payload
            })

            const data = await res.json();
            if (!res.ok) {
                toast.error(data.message || 'Failed to create event.', { id: toastId });
                return;
            }

            toast.success(data.message || 'Event created successfully.', { id: toastId });
            setFormValues(initialValues);
            if (imageInputRef.current) {
                imageInputRef.current.value = '';
            }
            setFieldErrors({});
        } catch (error) {
            console.error('Create event failed:', error);

            const message =
                error instanceof Error
                    ? error.message
                    : 'Something went wrong. Please try again.';

            toast.error(message, { id: toastId });

        } finally {
            setIsSubmitting(false);
            setIsNavbarDisabled(false);
        }
    };

    return (
        <div className="event-form">
            <form id="create-event-form" onSubmit={handleSubmit} noValidate>
                <TextInputField
                    label="Title"
                    id="title"
                    value={formValues.title}
                    error={fieldErrors.title}
                    onChange={handleChange}
                />
                <TextareaField
                    label="Description"
                    id="description"
                    value={formValues.description}
                    error={fieldErrors.description}
                    onChange={handleChange}
                />
                <TextareaField
                    label="Overview"
                    id="overview"
                    value={formValues.overview}
                    error={fieldErrors.overview}
                    onChange={handleChange}
                />
                <div className="form-field">
                    <label htmlFor="image" className="required-field">Image</label>
                    <input ref={imageInputRef} type="file" id="image" name="image" accept="image/*" required onChange={handleImageChange} />
                    {fieldErrors.image && <p className="field-error">{fieldErrors.image}</p>}
                </div>
                <TextInputField
                    label="Venue"
                    id="venue"
                    value={formValues.venue}
                    placeholder="e.g. Moscone Center"
                    error={fieldErrors.venue}
                    onChange={handleChange}
                />
                <TextInputField
                    label="Organizer"
                    id="organizer"
                    value={formValues.organizer}
                    placeholder="e.g. DevEvent Team"
                    error={fieldErrors.organizer}
                    onChange={handleChange}
                />
                <TextInputField
                    label="Location"
                    id="location"
                    value={formValues.location}
                    placeholder="e.g. San Francisco, CA"
                    error={fieldErrors.location}
                    onChange={handleChange}
                />
                <div className="form-row">
                    <TextInputField
                        label="Date"
                        id="date"
                        type="date"
                        value={formValues.date}
                        error={fieldErrors.date}
                        onChange={handleChange}
                    />
                    <TextInputField
                        label="Time"
                        id="time"
                        type="time"
                        value={formValues.time}
                        error={fieldErrors.time}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-field">
                    <label htmlFor="mode" className="required-field">Mode</label>
                    <select name="mode" id="mode" required value={formValues.mode} onChange={handleChange}>
                        <option value="online">Online</option>
                        <option value="offline">Offline</option>
                        <option value="hybrid">Hybrid</option>
                    </select>
                </div>
                <TextInputField
                    label="Audience"
                    id="audience"
                    value={formValues.audience}
                    placeholder="e.g. Frontend developers"
                    error={fieldErrors.audience}
                    onChange={handleChange}
                />
                <TextInputField
                    label="Tags"
                    id="tags"
                    value={formValues.tags}
                    placeholder="e.g. React, Next.js, TypeScript"
                    error={fieldErrors.tags}
                    onChange={handleChange}
                />
                <TextareaField
                    label="Agenda"
                    id="agenda"
                    value={formValues.agenda}
                    placeholder={"One item per line\nIntroduction\nLive demo\nQ&A"}
                    error={fieldErrors.agenda}
                    onChange={handleChange}
                />
                <button
                    type="submit"
                    className="button-submit"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Creating...' : 'Create Event'}
                </button>
            </form>
        </div>
    )
}

export default CreateEventForm