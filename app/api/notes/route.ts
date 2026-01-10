import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Note from "@/lib/model/Note";

// GET: Fetch ALL notes (list) OR a Single Note (content)
export async function GET(req: Request) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (id) {
    // Return full content for one note
    const note = await Note.findById(id);
    return NextResponse.json(note);
  } else {
    // Return list of notes (title + id only) for sidebar
    const notes = await Note.find().select("title updatedAt").sort({ updatedAt: -1 });
    return NextResponse.json(notes);
  }
}

// POST: Create a NEW Note
export async function POST(req: Request) {
  await connectDB();
  const { title, content } = await req.json();
  const note = await Note.create({ title: title || "Untitled Note", content: content || "" });
  return NextResponse.json(note);
}

// PUT: Update an EXISTING Note
export async function PUT(req: Request) {
  await connectDB();
  const { id, title, content } = await req.json();
  const note = await Note.findByIdAndUpdate(id, { title, content }, { new: true });
  return NextResponse.json(note);
}

// DELETE: Delete a Note
export async function DELETE(req: Request) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  await Note.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}