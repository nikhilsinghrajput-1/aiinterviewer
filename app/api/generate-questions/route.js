import { NextResponse } from 'next/server';
import { ai, MODEL_NAME } from '@/lib/gemini';
import { Type } from '@google/genai';

export async function POST(req) {
  try {
    const { resume, role, interviewType, experienceLevel } = await req.json();

    const prompt = `
      Act as an expert technical interviewer.
      Candidate Role: ${role}
      Experience Level: ${experienceLevel}
      Interview Type: ${interviewType}
      Resume: ${resume || "Not provided."}

      Generate exactly 7 interview questions.
      Make them increasingly difficult. Include technical depth, situational judgment, and problem-solving.
      For each question, provide a short 'hint' if the candidate gets stuck.
      Also categorize the question (e.g., 'System Design', 'Behavioral', 'Core Language', etc).
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  category: { type: Type.STRING },
                  hint: { type: Type.STRING }
                },
                required: ["question", "category", "hint"]
              }
            }
          },
          required: ["questions"]
        }
      }
    });

    const data = JSON.parse(response.text);
    return NextResponse.json(data);

  } catch (err) {
    console.error("Generate questions error:", err);
    return NextResponse.json({ error: "Failed to generate questions" }, { status: 500 });
  }
}
