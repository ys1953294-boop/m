import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeCode = async (code: string, filename: string): Promise<AnalysisResult> => {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    You are an expert senior software engineer. Please analyze the following code file: "${filename}".
    
    Provide a structured analysis in JSON format containing:
    1. "summary": A concise explanation of what the code does (max 2 sentences).
    2. "complexity": An estimation of complexity (Low, Medium, High) with a brief reason.
    3. "suggestions": A list of up to 3 specific improvements or best practices (performance, readability, security).

    Code content:
    ${code.slice(0, 20000)} 
    // Truncated if too long to save context window, though 3-flash handles large context well.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            complexity: { type: Type.STRING },
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["summary", "complexity", "suggestions"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    
    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Gemini Analysis Failed", error);
    throw new Error("Failed to analyze code.");
  }
};

export const explainSelection = async (codeSelection: string, context: string): Promise<string> => {
    const model = "gemini-3-flash-preview";
    const prompt = `
      Context (Full File):
      ${context.slice(0, 5000)}...
      
      User Selected Code:
      "${codeSelection}"
      
      Explain exactly what this selected specific block of code does in simple terms.
    `;
    
    const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
    });
    
    return response.text || "Could not generate explanation.";
}
