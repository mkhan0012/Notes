import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import connectDB from "@/lib/db";
import Note from "@/lib/model/Note";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const { question } = await req.json();

    // 1. Connect and Fetch User's Notes
    await connectDB();
    // In a real app, filtering by userId is crucial. Here we fetch all for the demo.
    const notes = await Note.find({}).select('title content');

    // 2. Prepare the Context (The "Memory")
    // We combine all notes into one big text block for the AI to read.
    const knowledgeBase = notes.map(n => `Title: ${n.title}\nContent: ${n.content}`).join("\n\n---\n\n");

    // 3. The Strict "Second Brain" Prompt
    const systemPrompt = `
      You are the user's personal "Second Brain" AI. 
      You have access to their personal database of notes below.
      
      User's Question: "${question}"
      
      Instructions:
      1. Search the "USER NOTES" below for the answer.
      2. If the answer is found, explain it clearly using the notes.
      3. If the answer is NOT in the notes, say: "I couldn't find that in your notes, but generally..." and then provide a general answer.
      4. Keep answers concise and helpful.
      
      USER NOTES DATABASE:
      ${knowledgeBase}
    `;

    // 4. Ask the AI
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3, // Low temperature for factual accuracy
    });

    return NextResponse.json({ answer: chatCompletion.choices[0]?.message?.content });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}