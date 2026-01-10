import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

// Debugging log to confirm the route is loaded
console.log("---------------- API ROUTE LOADED ----------------");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { text, mode, subMode } = await req.json();

    if (!text) return NextResponse.json({ result: "No text provided." });

    let systemPrompt = "You are an expert study assistant.";

    switch (mode) {
      // --- MODE 1: SUMMARIZATION ---
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

      // --- MODE 2: QUIZ GENERATION ---
      case 'quiz':
        systemPrompt = "Generate 3 Multiple Choice Questions (MCQs) based on the text. Format clearly with options A) B) C) D). Place the **Correct Answers** hidden at the very bottom.";
        break;

      // --- MODE 3: AUTO-FORMAT (FULL PAGE BEAUTIFIER) ---
      case 'auto-format':
        systemPrompt = `
          You are an elite Technical Interview Coach. 
          The user has pasted raw, messy notes. Your job is to restructure them into a "Master Interview Guide".
          
          For EVERY topic in the text, you MUST use this exact structure:
          
          ## [Emoji] [Topic Name]
          ### ✅ **Interview Answer**
          (A clear, concise definition 1-2 sentences).
          
          ### 🌍 **Real-Life Example**
          (Explain it using a non-technical analogy like pizza, traffic, home appliances, etc. Use blockquotes >).
          
          ### 💡 **Explanation**
          (Why does this matter? One short distinct point).
          
          ---
          
          Rules:
          1. Use specific emojis for every header.
          2. **Bold** all keywords.
          3. Fix all grammar.
          4. Keep it human and conversational.
        `;
        break;

      // --- MODE 4: ORGANIZE (FOR BUBBLE MENU CLUSTERS) ---
      case 'organize':
        systemPrompt = `
          You are an expert Note Organizer. 
          The user has selected a specific cluster of text. 
          Your job is to REWRITE and STRUCTURE this specific text into beautiful Markdown HTML.
          
          Rules:
          1. Do NOT delete information, just structure it.
          2. Use <h3> for the main topic header.
          3. Use <ul> and <li> for lists.
          4. Use <strong> for keywords.
          5. Make it readable and visually attractive.
          6. Return ONLY the HTML string (e.g. <h3>Title</h3><p>...</p>). Do not wrap in markdown code blocks.
        `;
        break;

      // --- MODE 5: DIAGRAMS ---
      case 'canvas':
        systemPrompt = "Convert the provided text into a text-based structural diagram (ASCII art) using arrows (->) and brackets [].";
        break;

      default:
        systemPrompt = "You are a helpful AI study assistant. Improve the following notes.";
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
      max_completion_tokens: 2048,
    });

    return NextResponse.json({ result: chatCompletion.choices[0]?.message?.content });

  } catch (error: any) {
    console.error("AI API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}