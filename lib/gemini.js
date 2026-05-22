import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini SDK
export const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// We fallback to gemini-2.0-flash if 2.5 is unavailable.
// For now, let's use gemini-2.5-flash as the primary model.
export const MODEL_NAME = "gemini-2.5-flash";
