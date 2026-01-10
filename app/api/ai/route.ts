import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    // 👇 FIX: Extract all needed variables from the JSON body here
    const { text, mode, subMode, question, userAnswer } = await req.json();

    if (!text && mode !== 'quiz-grade') return NextResponse.json({ result: "No text provided." });

    let systemPrompt = "You are an expert study assistant.";

    switch (mode) {
      // --- EXISTING MODES ---
      case 'summary':
        if (subMode === '1-Min Revision') {
          systemPrompt = "You are a revision expert. Summarize this into 3-5 high-impact bullet points. Focus ONLY on the critical facts. Use bold text for keywords.";
        } else if (subMode === 'ELI5 Mode') {
          systemPrompt = "Explain this topic as if the user is 5 years old. Use simple analogies like LEGOs, pizza, or traffic to explain complex concepts.";
        } else if (subMode === 'Exam Focused') {
          systemPrompt = "You are an exam setter. Identify 'High Yield' topics likely to appear on a test. List them as '🔥 Likely Exam Topics'. Highlight definitions and formulas.";
        } else if (subMode === 'Interview Prep') {
          systemPrompt = "You are a technical interviewer. Generate 3 potential interview questions based on this text. Provide a 'Model Answer' for each.";
        } else {
          systemPrompt = "Summarize the following text efficiently.";
        }
        break;

      case 'quiz':
        systemPrompt = "Generate 3 Multiple Choice Questions (MCQs) based on the text. Format clearly with options A) B) C) D). Place the **Correct Answers** hidden at the very bottom.";
        break;

      case 'auto-format':
        systemPrompt = `
          You are MindScribe AI. Transform messy notes into a "World-Class Documentation Page".
          Rules: Use <h1> <h2>, <strong>, <ul>/<li>. Improve clarity. Return HTML.
        `;
        break;

      case 'grammar':
        systemPrompt = "You are an expert Copy Editor. Correct grammar, spelling, and punctuation. Return ONLY the corrected text.";
        break;

      case 'organize':
        systemPrompt = "You are an expert Note Organizer. Structure this text into beautiful HTML with <h3> headers and lists.";
        break;

      case 'continue':
        systemPrompt = "You are a helpful co-writer. Write the NEXT 2-3 logical sentences to continue the user's thought.";
        break;

      case 'generate':
        systemPrompt = "You are MindScribe AI. Write a FULL, COMPREHENSIVE NOTE about the provided topic. Return HTML.";
        break;

      case 'chat-with-note':
        systemPrompt = "You are a helpful study tutor. Answer the user's question ONLY based on the provided notes context.";
        break;

      case 'interview-assist':
        systemPrompt = `
          You are a hidden Interview Assistant.
          INPUT: Knowledge Base (Notes) + Transcript.
          PROTOCOL:
          1. Is the transcript a question directed at the candidate?
          2. IF NO: Return "SILENCE".
          3. IF YES: Generate a concise (2-3 sentences) answer based strictly on the notes.
        `;
        break;

      case 'flashcards':
        systemPrompt = `
          You are a Teacher. Convert the notes into 5-7 Flashcards.
          OUTPUT: JSON Array only. Example: [{"front": "Q", "back": "A"}]
        `;
        break;

      // --- 👇 NEW STUDY LAB MODES ---
      
      case 'quiz-generate':
        systemPrompt = "You are a strict Professor. Generate ONE challenging open-ended question based on the user's notes. Return ONLY the question text.";
        break;

      case 'quiz-grade':
        systemPrompt = `
          You are a Grader. 
          CONTEXT: Question: "${question}", User Answer: "${userAnswer}", Notes: (Provided).
          TASK: Grade 0-100.
          OUTPUT JSON: { "score": 85, "feedback": "...", "correct_answer": "..." }
        `;
        break;

      case 'eli5':
        systemPrompt = "Explain this concept like the user is 5 years old. Use fun analogies (LEGOs, Pizza, Games). Keep it short.";
        break;

      // 👇 FIXED INTERVIEW PREP MODES
      case 'interview-q':
        systemPrompt = `
          You are a FAANG Hiring Manager. 
          Based on the user's notes, ask ONE tough technical or behavioral interview question.
          Return ONLY the question.
        `;
        break;

      case 'interview-feedback':
        systemPrompt = `
          You are a Hiring Manager.
          CONTEXT: 
          - Question: "${question}"
          - Candidate Answer: "${userAnswer}"
          - Knowledge Base: (User's notes)
          
          TASK: Provide feedback.
          OUTPUT JSON: {
            "rating": "Strong Hire" | "Hire" | "Weak Hire" | "No Hire",
            "feedback": "Critique of the answer...",
            "better_answer": "A perfect model answer would be..."
          }
        `;
        break;
        
      default:
        systemPrompt = "You are a helpful AI study assistant.";
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
      max_completion_tokens: 4096,
    });

    return NextResponse.json({ result: chatCompletion.choices[0]?.message?.content });

  } catch (error: any) {
    console.error("AI API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}