
import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";
import { FileData, ExtractionResult } from "../types";

export const extractDataFromDocs = async (files: FileData[]): Promise<ExtractionResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const mediaParts = files.map(file => ({
    inlineData: {
      mimeType: file.type,
      data: file.base64.split(',')[1] // remove data:image/png;base64, prefix
    }
  }));

  const prompt = "Extract the data according to the system instructions from these uploaded documents.";

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ parts: [...mediaParts, { text: prompt }] }],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      tools: [{ googleSearch: {} }],
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
    const jsonStr = response.text;
    if (!jsonStr) throw new Error("No response from AI");
    return JSON.parse(jsonStr) as ExtractionResult;
  } catch (error) {
    console.error("Failed to parse AI response:", error);
    throw new Error("Could not parse the extraction results. Please try again.");
  }
};
