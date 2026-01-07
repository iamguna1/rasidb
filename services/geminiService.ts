
import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";
import { FileData, ExtractionResult } from "../types";

export const extractDataFromDocs = async (files: FileData[]): Promise<ExtractionResult> => {
  // Always initialize with the process.env.API_KEY.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const mediaParts = files.map(file => ({
    inlineData: {
      mimeType: file.type,
      data: file.base64.split(',')[1] // remove data prefix
    }
  }));

  const prompt = "Extract the data according to the system instructions from these uploaded documents.";

  // Use gemini-3-pro-preview for complex document analysis tasks.
  // Removed googleSearch tool as it is not allowed when requiring JSON output via responseMimeType.
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: [{ parts: [...mediaParts, { text: prompt }] }],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          fields: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.INTEGER },
                fieldName: { type: Type.STRING },
                value: { type: Type.STRING }
              },
              required: ["id", "fieldName", "value"]
            }
          },
          immovablePropertyDescription: { type: Type.STRING },
          applicantsAndCoBorrowers: { type: Type.STRING }
        },
        required: ["fields", "immovablePropertyDescription", "applicantsAndCoBorrowers"]
      }
    }
  });

  try {
    // Access response.text directly (it is a property).
    const jsonStr = response.text;
    if (!jsonStr) throw new Error("No response from AI");
    return JSON.parse(jsonStr.trim()) as ExtractionResult;
  } catch (error) {
    console.error("Failed to parse AI response:", error);
    throw new Error("Could not parse the extraction results. Please try again.");
  }
};
