import { NextResponse } from 'next/server';
import { ai, MODEL_NAME } from '@/lib/gemini';
import { Type } from '@google/genai';

export async function POST(req) {
  try {
    const { question, answer, role, experienceLevel, category } = await req.json();

    const prompt = `
      Act as Maya, a strict, cynical, but ultimately fair AI interview coach (inspired by Duolingo's Lily).
      Role: ${role} (${experienceLevel})
      Category: ${category}
      
      Question: "${question}"
      Candidate's Answer: "${answer}"

      Evaluate the answer. Be strict. If it's a weak answer, score it low.
      Provide:
      1. score: 0 to 100
      2. verdict: A short 2-3 word summary (e.g., "Too shallow", "Excellent detail")
      3. strengths: Array of 1-3 strong points (if any)
      4. gaps: Array of 1-3 missing pieces or weaknesses
      5. betterFraming: How the candidate SHOULD have answered
      6. mayaReaction: A short, in-character spoken reaction from Maya (she is cynical and dry). 
         If the score is high (>80), she acts begrudgingly impressed. 
         If low (<60), she is disappointed or sarcastic.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            verdict: { type: Type.STRING },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            gaps: { type: Type.ARRAY, items: { type: Type.STRING } },
            betterFraming: { type: Type.STRING },
            mayaReaction: { type: Type.STRING }
          },
          required: ["score", "verdict", "strengths", "gaps", "betterFraming", "mayaReaction"]
        }
      }
    });

    const data = JSON.parse(response.text);
    return NextResponse.json(data);

  } catch (err) {
    console.error("Evaluate answer error:", err);
    return NextResponse.json({ error: "Failed to evaluate answer" }, { status: 500 });
  }
}
