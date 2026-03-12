import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateStudySchedule(tasks: any[], availableHours: number) {
  const prompt = `As a productivity coach, create a detailed study schedule for a student with the following tasks: ${JSON.stringify(tasks)}. 
  The student has ${availableHours} hours available today. 
  Return the schedule as a JSON array of objects with 'time', 'activity', and 'duration' fields. 
  Prioritize high-priority tasks and include short breaks.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            time: { type: Type.STRING },
            activity: { type: Type.STRING },
            duration: { type: Type.STRING },
          },
          required: ["time", "activity", "duration"],
        },
      },
    },
  });

  return JSON.parse(response.text || "[]");
}

export async function getProductivityTips(stats: any[]) {
  const prompt = `Based on these study statistics: ${JSON.stringify(stats)}, provide 3 concise, actionable productivity tips for the student.`;
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });
  return response.text;
}
