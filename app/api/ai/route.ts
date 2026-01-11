import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

function truncateText(text: string, maxChars: number = 20000) {
  if (!text) return "";
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars) + "... [TRUNCATED]";
}

export async function POST(req: Request) {
  try {
    const { text, mode, subMode, question, userAnswer } = await req.json();

    if (!text && mode !== 'quiz-grade' && mode !== 'interview-feedback') {
      return NextResponse.json({ result: "No context provided." });
    }

    const processedText = truncateText(text);

    let model = "llama-3.1-8b-instant"; 
    let maxTokens = 1024;
    let temperature = 0.5;
    let jsonMode = false; 
    let systemPrompt = "You are a helpful study assistant.";

    switch (mode) {
      
      // --- OTHER MODES (Keep these as they were) ---
      case 'summary':
        model = "llama-3.1-8b-instant";
        if (subMode === '1-Min Revision') systemPrompt = "Create a Cheat Sheet. 5 bullet points. Bold keywords.";
        else if (subMode === 'ELI5 Mode') systemPrompt = "Explain like I'm 5. Use analogies.";
        else if (subMode === 'Exam Focused') systemPrompt = "Identify High Yield exam topics.";
        else if (subMode === 'Interview Prep') systemPrompt = "Generate 3 technical interview questions.";
        else systemPrompt = "Summarize efficiently.";
        break;

      case 'flashcards':
        model = "llama-3.1-8b-instant";
        jsonMode = true;
        systemPrompt = `Create 5-7 flashcards. OUTPUT JSON: { "flashcards": [{"front": "Q", "back": "A"}] }`;
        break;

      case 'auto-format':
        model = "llama-3.1-8b-instant";
        maxTokens = 4096;
        systemPrompt = `Format notes into clean HTML/Markdown. Use <h1>, <ul>, <strong>.`;
        break;

      // --- 🚀 UPDATED INTERVIEW LOGIC ---
      case 'interview-assist':
        model = "llama-3.3-70b-versatile"; // Smartest model for reasoning
        maxTokens = 600;
        temperature = 0.6;
        systemPrompt = `
          You are an expert Senior Developer/Candidate in an interview.
          CONTEXT: The User's Notes (Knowledge Base).
          INPUT: Live Transcript.

          YOUR ALGORITHM:
          1. ANALYZE: Is the INPUT a direct question addressed to you? 
             - If NO (silence, small talk, thinking sounds): Return exactly "SILENCE".
          
          2. IF YES (It is a question), generate an answer following this EXACT structure:
             
             - **Direct Answer**: A concise, technical answer based on the notes.
             - **Real-Life Example**: A specific scenario (e.g., "For example, when building a scalable API...").
             - **Importance**: Why this concept matters in production (e.g., "This ensures data consistency...").

          CONSTRAINTS:
          - Keep the total response conversational and under 80 words.
          - Speak in the first person ("I would...").
          - Do not use headers like "Answer:" or "Example:", just flow naturally.
        `;
        break;

      // --- OTHER MODES ---
      case 'quiz-grade':
        model = "llama-3.3-70b-versatile"; 
        jsonMode = true;
        systemPrompt = `Grade 0-100. JSON: { "score": number, "feedback": "string", "correct_answer": "string" }`;
        break;

      case 'interview-feedback':
        model = "llama-3.3-70b-versatile";
        jsonMode = true;
        systemPrompt = `Evaluate answer. JSON: { "rating": "string", "feedback": "string", "better_answer": "string" }`;
        break;

      case 'chat-with-note':
        model = "llama-3.3-70b-versatile";
        systemPrompt = "Answer using ONLY the provided notes context.";
        break;

      case 'generate':
        model = "llama-3.3-70b-versatile";
        maxTokens = 4096;
        systemPrompt = "Write a comprehensive study note in HTML.";
        break;

      default:
        return NextResponse.json({ result: "Invalid mode" }, { status: 400 });
    }

    const completionPayload: any = {
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: processedText }
      ],
      model: model,
      temperature: temperature,
      max_completion_tokens: maxTokens,
    };

    if (jsonMode) {
      completionPayload.response_format = { type: "json_object" };
    }

    const chatCompletion = await groq.chat.completions.create(completionPayload);
    const result = chatCompletion.choices[0]?.message?.content || "";

    if (jsonMode) {
        try {
            const parsed = JSON.parse(result);
            return NextResponse.json(parsed); 
        } catch (e) {
            return NextResponse.json({ result }); 
        }
    }

    return NextResponse.json({ result });

  } catch (error: any) {
    console.error("AI API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}