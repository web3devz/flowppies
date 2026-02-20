import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
const MODEL_ID = 'gemini-2.0-flash';

export async function POST(req: NextRequest) {
  try {
    // Parse the request body to get the original backstory
    const body = await req.json();
    const { prompt, originalBackstory } = body;
    
    if (!originalBackstory) {
      return NextResponse.json({ error: 'Original backstory is required' }, { status: 400 });
    }

    // Create a modified prompt that instructs Gemini to make subtle changes to the backstory
    const modifiedPrompt = `
      Create a slightly evolved version of the following NFT pet backstory. 
      
      Important guidelines:
      - Keep most of the original story intact
      - Make only subtle changes that show growth or progression
      - Don't completely change character traits or major plot points
      - The changes should feel natural and connected to the original story
      - Keep the same writing style and tone
      
      Original Backstory: ${originalBackstory}
      
      User guidance for evolution: ${prompt || "Make a subtle change to show character growth"}
    `;

    const result = await ai.models.generateContent({
      model: MODEL_ID,
      contents: [{ role: "user", parts: [{ text: modifiedPrompt }] }],
      config: { temperature: 0.7 },
    });
    const modifiedBackstory = result?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    // Return the modified backstory
    return NextResponse.json({ 
      originalBackstory,
      modifiedBackstory
    });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred during backstory generation' },
      { status: 500 }
    );
  }
}