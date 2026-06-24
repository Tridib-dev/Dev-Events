// app/api/events/route.ts

import { Event } from "@/database/event.model";
import connectToDatabase from "@/lib/mongodb";
import imagekit from "@/lib/imagekit";
import { type EventCategory } from "@/lib/constants/event-categories";
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { validateEmails } from "@/lib/validateemail";

type AgendaItem = {
    startTime: string;
    endTime: string;
    keynote: string;
};

type ImageKitUploadResult = {
    url: string;
    fileId?: string;
    file_id?: string;
    fileID?: string;
};

const isDuplicateKeyError = (error: unknown): boolean =>
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: number }).code === 11000;

// export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();

        const formData = await req.formData();

        const eventFields = Object.fromEntries(formData.entries()) as Record<string, FormDataEntryValue>;
        const slugValue = eventFields.slug;

        if (typeof slugValue !== "string" || slugValue.trim().length === 0) {
            return NextResponse.json({ message: "Slug is required" }, { status: 400 });
        }

        const slug = slugValue.trim();

        const organizerEmails = formData.getAll("organizerEmails") as string[];
        const emailCheck = await validateEmails(organizerEmails);
        if (!emailCheck.valid) {
            return Response.json({ error: emailCheck.reason }, { status: 400 });
        }

        const fileEntry = formData.get("image");
        if (!(fileEntry instanceof File) || fileEntry.size === 0) {
            return NextResponse.json({ message: 'Image File is required' }, { status: 400 });
        }
        const file = fileEntry;

        const tags = formData.getAll('tags') as string[];

        let agenda: AgendaItem[];
        try {
            agenda = JSON.parse(formData.get('agenda') as string);
            if (!Array.isArray(agenda) || agenda.length === 0) {
                throw new Error("Agenda must be a non-empty array.");
            }
        } catch {
            return NextResponse.json({ message: "Invalid agenda data." }, { status: 400 });
        }

        const existingEvent = await Event.findOne({ slug });
        if (existingEvent) {
            return NextResponse.json({ message: "An event with this slug already exists" }, { status: 409 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadResult = (await imagekit.upload({
            file: buffer,
            fileName: `${Date.now()}-${file.name}`,
            folder: "/DevEvent",
        })) as ImageKitUploadResult;

        const imageFileId = uploadResult.fileId || uploadResult.file_id || uploadResult.fileID;

        try {
            const create_event = await Event.create({
                title: String(eventFields.title ?? ""),
                slug,
                description: String(eventFields.description ?? ""),
                overview: String(eventFields.overview ?? ""),
                image: uploadResult.url,
                venue: String(eventFields.venue ?? ""),
                location: String(eventFields.location ?? ""),
                address: String(eventFields.address ?? ""),
                city: String(eventFields.city ?? ""),
                state: String(eventFields.state ?? ""),
                country: String(eventFields.country ?? ""),
                category: String(eventFields.category ?? "") as EventCategory,
                date: String(eventFields.date ?? ""),
                time: String(eventFields.time ?? ""),
                mode: String(eventFields.mode ?? ""),
                audience: String(eventFields.audience ?? ""),
                organizer: String(eventFields.organizer ?? ""),
                tags,
                agenda,
                organizerEmails, 
            });
            revalidateTag("events", "max");
            return NextResponse.json({ message: 'Event Created Successfully', event: create_event }, { status: 201 });
        } catch (createErr: unknown) {
            if (imageFileId) {
                try {
                    await imagekit.deleteFile(imageFileId);
                } catch (deleteErr: unknown) {
                    console.error('ImageKit cleanup failed for fileId', imageFileId, deleteErr);
                }
            }

            if (isDuplicateKeyError(createErr)) {
                return NextResponse.json({ message: "An event with this slug already exists" }, { status: 409 });
            }

            console.error('Event creation failed:', createErr);
            return NextResponse.json(
                {
                    message: 'Event Creation failed',
                    error: createErr instanceof Error ? createErr.message : 'Unknown',
                },
                { status: 500 }
            );
        }

    } catch (err: unknown) {
        if (isDuplicateKeyError(err)) {
            return NextResponse.json({ message: "An event with this slug already exists" }, { status: 409 });
        }
        console.error(err);
        return NextResponse.json({ message: 'Event Creation failed', error: err instanceof Error ? err.message : 'Unknown' }, { status: 500 });
    }
}

export async function GET() {
    try{
        await connectToDatabase();

        const events = await Event.find().sort({createdAt : -1});

        return NextResponse.json({message : 'Event Fetched Successfully' , events},{status : 200});
    }catch(err){
      console.error('Event fetching failed:', err);
      return NextResponse.json({message : 'Event Fetching Failed',error : err},{status:500});
    }
}
