import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Helper to prevent token overflow
function truncateText(text: string, maxLength: number = 15000) {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "... [TRUNCATED FOR SPEED]";
}

export async function POST(req: Request) {
  try {
    const { text, mode, subMode, question, userAnswer } = await req.json();

    if (!text && mode !== 'quiz-grade') return NextResponse.json({ result: "No text provided." });

    // 1. OPTIMIZE INPUT: Truncate very long text to save input tokens
    const processedText = truncateText(text);

    let systemPrompt = "You are an expert study assistant.";
    
    // Default to the lighter model to save tokens unless logic requires the big one
    let model = "llama-3.1-8b-instant"; 
    let maxTokens = 1024; // Default lower token limit for speed

    switch (mode) {
      // --- LIGHTWEIGHT MODES (Llama-3.1-8b) ---
      case 'summary':
        // User requested: Revision, Exam, Interview Prep, ELI5 -> 8b-instant
        model = "llama-3.1-8b-instant";
        if (subMode === '1-Min Revision') {
          systemPrompt = "Summarize this into 3-5 high-impact bullet points. Focus ONLY on the critical facts. Use bold text for keywords. Be extremely concise.";
        } else if (subMode === 'ELI5 Mode') {
          systemPrompt = "Explain this topic as if the user is 5 years old. Use simple analogies like LEGOs, pizza, or traffic to explain complex concepts.";
        } else if (subMode === 'Exam Focused') {
          systemPrompt = "You are an exam setter. Identify 'High Yield' topics likely to appear on a test. List them as '🔥 Likely Exam Topics'. Highlight definitions and formulas.";
        } else if (subMode === 'Interview Prep') {
          systemPrompt = "You are a technical interviewer. Generate 3 potential interview questions based on this text. Provide a short 'Model Answer' for each.";
        } else {
          systemPrompt = "Summarize the following text efficiently.";
        }
        break;

      case 'eli5':
        model = "llama-3.1-8b-instant";
        systemPrompt = "Explain this concept like the user is 5 years old. Keep it short and fun.";
        break;

      case 'grammar':
        model = "llama-3.1-8b-instant";
        systemPrompt = "Correct grammar, spelling, and punctuation. Return ONLY the corrected text. Do not add conversational filler.";
        break;

      case 'flashcards':
        model = "llama-3.1-8b-instant";
        systemPrompt = `Convert the notes into 5-7 Flashcards. OUTPUT JSON Array only: [{"front": "Q", "back": "A"}]`;
        break;

      // --- HEAVYWEIGHT MODES (Llama-3.3-70b) ---
      
      case 'quiz':
        model = "llama-3.3-70b-versatile"; // Needs logic to ensure correct answers
        maxTokens = 2048;
        systemPrompt = "Generate 3 Multiple Choice Questions (MCQs) based on the text. Format clearly with options A) B) C) D). Place the **Correct Answers** hidden at the very bottom.";
        break;

      case 'interview-assist':
        model = "llama-3.3-70b-versatile"; // Needs high reasoning to connect question to notes
        maxTokens = 1024; // Answers should be concise
        systemPrompt = `
          You are a hidden Interview Assistant.
          INPUT: Knowledge Base (Notes) + Transcript.
          PROTOCOL:
          1. Is the transcript a question directed at the candidate?
          2. IF NO: Return "SILENCE".
          3. IF YES: Generate a concise (2-3 sentences) answer based strictly on the notes.
        `;
        break;

      case 'chat-with-note':
        model = "llama-3.3-70b-versatile"; // RAG needs better context understanding
        maxTokens = 2048;
        systemPrompt = "You are a helpful study tutor. Answer the user's question ONLY based on the provided notes context. Be concise.";
        break;

      case 'generate':
        model = "llama-3.3-70b-versatile"; // Creative writing needs the big model
        maxTokens = 4096;
        systemPrompt = "You are MindScribe AI. Write a FULL, COMPREHENSIVE NOTE about the provided topic. Return HTML.";
        break;
      
      case 'auto-format':
        model = "llama-3.1-8b-instant"; // formatting is easy for 8b
        maxTokens = 4096; // Needs space to return full text
        systemPrompt = `Transform messy notes into clean HTML. Use <h1> <h2>, <strong>, <ul>/<li>.`;
        break;

      // --- STUDY LAB ---

      case 'quiz-generate':
        model = "llama-3.1-8b-instant"; // Simple generation
        systemPrompt = "Generate ONE challenging open-ended question based on the user's notes. Return ONLY the question text.";
        break;

      case 'quiz-grade':
        model = "llama-3.3-70b-versatile"; // Grading requires reasoning
        systemPrompt = `
          You are a Grader. 
          CONTEXT: Question: "${question}", User Answer: "${userAnswer}", Notes: (Provided).
          TASK: Grade 0-100.
          OUTPUT JSON: { "score": 85, "feedback": "...", "correct_answer": "..." }
        `;
        break;

      case 'interview-q':
        model = "llama-3.1-8b-instant"; // Simple generation
        systemPrompt = "Ask ONE tough technical or behavioral interview question based on the notes. Return ONLY the question.";
        break;

      case 'interview-feedback':
        model = "llama-3.3-70b-versatile"; // Feedback needs depth
        maxTokens = 2048;
        systemPrompt = `
          You are a Hiring Manager.
          CONTEXT: Question: "${question}", Answer: "${userAnswer}".
          TASK: Provide feedback.
          OUTPUT JSON: {
            "rating": "Strong Hire" | "Hire" | "Weak Hire" | "No Hire",
            "feedback": "Critique...",
            "better_answer": "Model answer..."
          }
        `;
        break;

      case 'continue':
        model = "llama-3.3-70b-versatile"; // Creative continuation
        systemPrompt = "Write the NEXT 2-3 logical sentences to continue the user's thought.";
        break;

      default:
        systemPrompt = "You are a helpful AI study assistant.";
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: processedText }
      ],
      model: model,
      temperature: 0.5,
      max_completion_tokens: maxTokens, // 2. OPTIMIZE OUTPUT: Dynamic token limits
    });

    return NextResponse.json({ result: chatCompletion.choices[0]?.message?.content });

  } catch (error: any) {
    console.error("AI API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}