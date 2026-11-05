import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from 'cloudinary';
import { auth } from "@/auth";

import connectDB from "@/lib/mongodb";
import Event from '@/database/event.model';

type CloudinaryUploadResult = {
	secure_url: string;
};


export async function POST(req: NextRequest) {
	try {
		const session = await auth();
		if (!session?.user) {
			return NextResponse.json(
				{ message: "You must be signed in to create an event." },
				{ status: 401 }
			);
		}

		const userId = session.user.id;
		const userRole = session.user.role;

		await connectDB();

		if (userRole !== "admin") {
			const existingCount = await Event.countDocuments({ createdBy: userId });
			if (existingCount >= 2) {
				return NextResponse.json(
					{ message: "You have reached the maximum limit of 2 events." },
					{ status: 403 }
				);
			}

		}

		const formData = await req.formData();

		// Validate & read image
		const imageValue = formData.get("image");
		if (!(imageValue instanceof File)) {
			return NextResponse.json({ message: "Image file is required" }, { status: 400 });
		}

		// Make string-only fields (exclude image, we handle it separately, because it's a File, and databases cannot store files directly, 
		// only their URLs, and we will get the URL after uploading to Cloudinary)
		const eventFields: Record<string, string> = {};
		for (const [k, v] of formData.entries()) {
			if (k === "image") continue; // If it's the image field, skip it for now
			if (typeof v === "string") eventFields[k] = v;
		}


		// Upload image to Cloudinary to get a URL we can store in the database
		const arrayBuffer = await imageValue.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		const uploadResult = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
			cloudinary.uploader
				.upload_stream({ resource_type: "image", folder: "StackMeet" }, (error, result) => {
					if (error) return reject(error);
					if (!result?.secure_url) return reject(new Error("Cloudinary upload failed"));
					resolve({ secure_url: result.secure_url });
				})
				.end(buffer);
		});

		// Build final payload with correct types
		const eventPayload = {
			...eventFields,
			image: uploadResult.secure_url,
			tags: JSON.parse(formData.get("tags") as string),
			agenda: JSON.parse(formData.get("agenda") as string),
			createdBy: userId,
		};

		const createdEvent = await Event.create(eventPayload);

		return NextResponse.json(
			{ message: 'Event created successfully', event: createdEvent },
			{ status: 201 });
	} catch (e) {
		console.error('Event creation failed:', e);
		const errors = e as {
			code?: number; keyPattern?: Record<string, unknown>;
		};
		if (errors?.code === 11000) {
			return NextResponse.json(
				{
					message: 'An event with this title already exists.',
					code: 'DUPLICATE_EVENT_TITLE',
				},
				{ status: 409 }
			)

		}
	}
	return NextResponse.json(
		{ message: 'Event Creation Failed', error: 'Unknown' },
		{ status: 500 }
	)
}

export async function GET() {
	try {
		await connectDB();
		const events = await Event.find().sort({ createdAt: -1 });
		return NextResponse.json({ message: 'Events fetched successfully', events }, { status: 200 });
	} catch (e) {
		console.error('Event fetching failed:', e);
		return NextResponse.json({
			message: 'Event fetching failed',
			...(process.env.NODE_ENV === "development" && {
				error: (e as Error).message,
			}),
		}, { status: 500 });
	}
}