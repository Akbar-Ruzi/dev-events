import { Schema, model, models, Document, Types } from 'mongoose';

export interface AgendaItem {
  time: string;
  item: string;
}

// Base event data type without MongoDB document properties and it is is the blueprint of the event data
export interface EventFields {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue?: string; // Required for in-person and hybrid events.
  location?: string; // Required for in-person and hybrid events.
  onlineUrl?: string; // For online and hybrid events. Hidden from queries by default.
  date: string;
  time: string;
  mode: 'online' | 'in-person' | 'hybrid';
  audience: string;
  agenda?: AgendaItem[];
  organizer: string;
  tags?: string[];
}

// IEvent full Mongoose event document type and it is the real database document object created from that blueprint(EventFields)
//  with additional properties like _id, createdAt, updatedAt, etc.

interface IEvent extends EventFields, Document {
  createdAt: Date;
  updatedAt: Date;
  createdBy: Types.ObjectId; // Reference to the User who created the event
}

const EventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      immutable: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    overview: {
      type: String,
      required: [true, 'Overview is required'],
      trim: true,
      maxlength: [500, 'Overview cannot exceed 500 characters'],
    },
    image: {
      type: String,
      required: [true, 'Image URL is required'],
      trim: true,
    },
    venue: {
      type: String,
      required: [needsPhysicalPlace, 'Venue is required for in-person and hybrid events'],
      trim: true,
    },
    location: {
      type: String,
      required: [needsPhysicalPlace, 'Location is required for in-person and hybrid events'],
      trim: true,
    },
    onlineUrl: {
      type: String,
      trim: true,
      select: false, // Keeps the link out of public responses. Use .select('+onlineUrl') to read it.
      validate: {
        validator: isHttpUrl,
        message: 'Online link must be a valid http or https URL',
      },
    },
    date: {
      type: String,
      required: [true, 'Date is required'],
    },
    time: {
      type: String,
      required: [true, 'Time is required'],
    },
    mode: {
      type: String,
      required: [true, 'Mode is required'],
      enum: {
        values: ['online', 'in-person', 'hybrid'],
        message: 'Mode must be either online, in-person, or hybrid',
      },
    },
    audience: {
      type: String,
      required: [true, 'Audience is required'],
      trim: true,
    },
    agenda: {
      type: [
        {
          _id: false,
          time: {
            type: String,
            required: [true, 'Agenda item time is required'],
            trim: true,
          },
          item: {
            type: String,
            required: [true, 'Agenda item text is required'],
            trim: true,
          },
        },
      ],
    },
    organizer: {
      type: String,
      required: [true, 'Organizer is required'],
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'CreatedBy is required'],
      index: true, // Add index for better query performance on createdBy field
    },
    tags: {
      type: [String],
    },
  },
  {
    timestamps: true, // Auto-generate createdAt and updatedAt
  }
);

// Pre-save hook for slug generation and data normalization
EventSchema.pre('save', function (next) {

  // Generate the slug only once, so links people have shared keep working after an edit
  if (this.isNew) {
    this.slug = generateSlug(this.title);
  }

  // Normalize date to ISO format if it's not already
  if (this.isModified('date')) {
    this.date = normalizeDate(this.date);
  }

  // Normalize time format (HH:MM)
  if (this.isModified('time')) {
    this.time = normalizeTime(this.time);
  }

  next();
});

// Helper function to require venue and location only when the event has a physical place
function needsPhysicalPlace(this: IEvent): boolean {
  return this.mode === 'in-person' || this.mode === 'hybrid';
}

// Helper function to allow only http and https links
function isHttpUrl(value: string): boolean {
  try {
    const { protocol } = new URL(value);
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
}

// Helper function to generate URL-friendly slug
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

// Helper function to normalize date to ISO format
function normalizeDate(dateString: string): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date format');
  }
  return date.toISOString().split('T')[0]; // Return YYYY-MM-DD format
}

// Helper function to normalize time format
function normalizeTime(timeString: string): string {
  // Handle various time formats and convert to HH:MM (24-hour format)
  const timeRegex = /^(\d{1,2}):(\d{2})(\s*(AM|PM))?$/i;
  const match = timeString.trim().match(timeRegex);

  if (!match) {
    throw new Error('Invalid time format. Use HH:MM or HH:MM AM/PM');
  }

  let hours = parseInt(match[1]);
  const minutes = match[2];
  const period = match[4]?.toUpperCase();

  if (period) {
    // Convert 12-hour to 24-hour format
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
  }

  if (hours < 0 || hours > 23 || parseInt(minutes) < 0 || parseInt(minutes) > 59) {
    throw new Error('Invalid time values');
  }

  return `${hours.toString().padStart(2, '0')}:${minutes}`;
}

// Create compound index for common queries
EventSchema.index({ date: 1, mode: 1 });

const Event = models.Event || model<IEvent>('Event', EventSchema);

export default Event;