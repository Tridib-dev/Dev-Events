// app/api/events/route.ts

import { Event } from "@/database/event.model";
import connectToDatabase from "@/lib/mongodb";
import imagekit from "@/lib/imagekit";
import { NextRequest, NextResponse } from "next/server";
import { validateEmails } from "@/lib/validateemail";


// export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();

        const formData = await req.formData();

        let event: any;
        try {
            event = Object.fromEntries(formData.entries());
        } catch (err) {
            return NextResponse.json({ message: "Invalid Json Form Data" }, { status: 400 });
        }

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

        let agenda: any[];
        try {
            agenda = JSON.parse(formData.get('agenda') as string);
            if (!Array.isArray(agenda) || agenda.length === 0) {
                throw new Error("Agenda must be a non-empty array.");
            }
        } catch (err) {
            return NextResponse.json({ message: "Invalid agenda data." }, { status: 400 });
        }

        const existingEvent = await Event.findOne({ slug: event.slug });
        if (existingEvent) {
            return NextResponse.json({ message: "An event with this slug already exists" }, { status: 409 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadResult: any = await imagekit.upload({
            file: buffer,
            fileName: `${Date.now()}-${file.name}`,
            folder: "/DevEvent",
        });

        event.image = uploadResult.url;
        event.imageFileId = uploadResult.fileId || uploadResult.file_id || uploadResult.fileID;

        try {
            const create_event = await Event.create({
                ...event,
                tags,
                agenda,
                organizerEmails, 
            });
            return NextResponse.json({ message: 'Event Created Successfully', event: create_event }, { status: 201 });
        } catch (createErr: any) {
            const fileId = event.imageFileId;
            if (fileId) {
                try {
                    await imagekit.deleteFile(fileId);
                } catch (deleteErr) {
                    console.error('ImageKit cleanup failed for fileId', fileId, deleteErr);
                }
            }

            if (createErr && createErr.code === 11000) {
                return NextResponse.json({ message: "An event with this slug already exists" }, { status: 409 });
            }

            console.error('Event creation failed:', createErr);
            return NextResponse.json({ message: 'Event Creation failed', error: createErr instanceof Error ? createErr.message : 'Unknown' }, { status: 500 });
        }

    } catch (err: any) {
        if (err.code === 11000) {
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