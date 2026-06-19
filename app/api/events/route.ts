// app/api/events/route.ts

import { Event } from "@/database/event.model";
import connectToDatabase from "@/lib/mongodb";
import imagekit from "@/lib/imagekit";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest) {
    
    try{
    await connectToDatabase();

    // Await formData exactly once
    const formData = await req.formData();

    let event: any;
    try {
      event = Object.fromEntries(formData.entries());
    } catch (err) {
      return NextResponse.json({ message: "Invalid Json Form Data" }, { status: 400 });
    }

    // Validate image presence
    const fileEntry = formData.get("image");
    if (!(fileEntry instanceof File) || fileEntry.size === 0) {
      return NextResponse.json({ message: 'Image File is required' }, { status: 400 });
    }
    const file = fileEntry;

    let tags = (formData.get('tags') as string).split(',');
    let agenda = (formData.get('agenda') as string).split(',');


    // Check slug uniqueness before uploading image
    const existingEvent = await Event.findOne({ slug: event.slug });
    if (existingEvent) {
      return NextResponse.json({ message: "An event with this slug already exists" }, { status: 409 });
    }

    // Upload image to ImageKit
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult: any = await imagekit.upload({
      file: buffer,
      fileName: `${Date.now()}-${file.name}`,
      folder: "/DevEvent",
    });

    // Attach upload info to event payload
    event.image = uploadResult.url;
    event.imageFileId = uploadResult.fileId || uploadResult.file_id || uploadResult.fileID;

    // Attempt to create DB record; if it fails, rollback uploaded image
    try {
      const create_event = await Event.create({
        ...event,
        tags : tags ,
        agenda : agenda,
      });
      return NextResponse.json({ message: 'Event Created Successfully' }, { status: 201 });
    } catch (createErr: any) {
      // Attempt rollback if image was uploaded and we have a fileId
      const fileId = event.imageFileId;
      if (fileId) {
        try {
          await imagekit.deleteFile(fileId);
        } catch (deleteErr) {
          console.error('ImageKit cleanup failed for fileId', fileId, deleteErr);
        }
      }

      // Propagate original DB error (handle duplicate key specially)
      if (createErr && createErr.code === 11000) {
        return NextResponse.json({ message: "An event with this slug already exists" }, { status: 409 });
      }

      console.error('Event creation failed:', createErr);
      return NextResponse.json({ message: 'Event Creation failed', error: createErr instanceof Error ? createErr.message : 'Unknown' }, { status: 500 });
    }

    }catch(err : any){
    if (err.code === 11000) {
        return Response.json(
          { message: "An event with this slug already exists" },
          { status: 409 }
        );
    }
        console.error(err);
        return NextResponse.json({message : 'Event Creation failed' , error : err instanceof Error ?  err.message : 'Unknwon'},{status : 500})
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