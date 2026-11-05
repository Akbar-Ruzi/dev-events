import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Event from '@/database/event.model';
import { auth } from "@/auth";

// Define route params type for type safety
type RouteParams = {
  params: Promise<{
    slug: string
  }>;
};

type AuthorizedEventResult =
  | { error: NextResponse; event?: never; slug?: never }
  | { error?: never; event: NonNullable<Awaited<ReturnType<typeof Event.findOne>>>; slug: string };

/**
 * GET /api/events/[slug]
 * Fetches a single event by its slug
 * @param request - The incoming request object
 * @param params - Route parameters containing the slug
 * @returns JSON response with event data or error message
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    // Connect to database
    await connectDB();

    //Await the slug from params
    const { slug } = await params;

    // Validate slug parameter

    if (!slug || typeof slug !== 'string' || slug.trim() === '') {
      return NextResponse.json(
        { message: 'Invalid or missing slug parameter' },
        { status: 400 }
      );
    }

    // Sanitize slug ( Trim whitespace and validate slug format)

    const sanitizedSlug = slug.trim().toLowerCase();
    if (!sanitizedSlug) {
      return NextResponse.json(
        { message: 'Slug parameter cannot be empty' },
        { status: 400 }
      );
    }


    // Query for event by slug
    const event = await Event.findOne({ slug: sanitizedSlug }).lean();

    // Check if event exists
    if (!event) {
      return NextResponse.json(
        { message: `Event with slug '${sanitizedSlug}' not found` },
        { status: 404 }
      );
    }

    // Return successful response with event data
    return NextResponse.json(
      {
        message: 'Event fetched successfully',
        event
      },
      { status: 200 }
    );

  } catch (error) {
    // Log error for debugging (in production, use proper logging)
    // Log error for debugging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching event by slug:', error);
    }
    // Handle database connection errors
    if (error instanceof Error) {
      // Check for specific MongoDB errors if needed

      if (error.message.includes('MONGODB_URI')) {
        return NextResponse.json(
          { message: 'Database configuration error' },
          { status: 500 }
        );
      }

      // Return generic error with error message
      return NextResponse.json(
        { message: 'Failed to fetch event', error: error.message },
        { status: 500 }
      );
    }

    // Handle unexpected errors
    return NextResponse.json(
      { message: 'An unexpected error occurred while fetching the event' },
      { status: 500 }
    );
  }
}

async function getAuthorizedEvent(params: Promise<{ slug: string }>): Promise<AuthorizedEventResult> {
  const session = await auth();
  if (!session?.user) {
    return { error: NextResponse.json({ message: "Unauthorized" }, { status: 401 }) };
  }

  await connectDB();

  const { slug } = await params;
  const normalizedSlug = slug.trim().toLowerCase();

  const event = await Event.findOne({ slug: normalizedSlug });
  if (!event) {
    return {
      error: NextResponse.json(
        { message: `Event with slug '${normalizedSlug}' not found` },
        { status: 404 }
      )
    };
  }

  const isAdmin = session.user.role === "admin";
  const isOwner = event.createdBy.toString() === session.user.id;

  if (!isAdmin && !isOwner) {
    return {
      error: NextResponse.json(
        { message: "You are not allowed to modify this event." },
        { status: 403 }
      )
    };
  }

  return {event, slug: normalizedSlug };
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const result = await getAuthorizedEvent(params);
    if ("error" in result) return result.error!;

    const body = await request.json();
    const updatedEvent = await Event.findOneAndUpdate(
      { slug: result.slug },
      { $set: body },
      { new: true, runValidators: true }
    );

    return NextResponse.json(
      { message: "Event updated successfully", event: updatedEvent },
      { status: 200 }
    );
  } catch (error) {
    console.error("Event update failed:", error);
    return NextResponse.json({ message: "Failed to update event" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const result = await getAuthorizedEvent(params);
    if ("error" in result) return result.error!;

    await Event.deleteOne({ slug: result.slug });

    return NextResponse.json({ message: "Event deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Event deletion failed:", error);
    return NextResponse.json({ message: "Failed to delete event" }, { status: 500 });
  }
}