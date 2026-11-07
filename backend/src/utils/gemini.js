import { GoogleGenAI } from "@google/genai";

export const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
export const MODEL = process.env.GEMINI_MODEL;

export const SYSTEM = `You are a code assistant inside a web code editor.
The user's current file is provided. When asked to find bugs, list each bug
with the line number, why it is a problem, and a fixed snippet.
If there are no bugs, say so. Be concise.`;
