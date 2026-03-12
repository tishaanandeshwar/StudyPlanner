import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const generateStudyPlan = async (params: {
  subjects: string[];
  examDates: string;
  studyHoursPerDay: number;
  difficulty: string;
}) => {
  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate a detailed study plan for the following subjects: ${params.subjects.join(", ")}. 
    The exam period starts around ${params.examDates}. 
    I can study ${params.studyHoursPerDay} hours per day. 
    The difficulty level is ${params.difficulty}.
    
    Return the response as a JSON array of daily schedules. Each day should have:
    - day: string (e.g., "Day 1")
    - sessions: array of { time: string, subject: string, topic: string, duration: string }
    - tips: array of strings (study tips for that day)`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            day: { type: Type.STRING },
            sessions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  time: { type: Type.STRING },
                  subject: { type: Type.STRING },
                  topic: { type: Type.STRING },
                  duration: { type: Type.STRING },
                },
              },
            },
            tips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
        },
      },
    },
  });

  const response = await model;
  return JSON.parse(response.text || "[]");
};

export const getMotivationalQuote = async () => {
  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: "Give me a short, powerful motivational quote for a student studying for exams. Return just the quote and the author.",
  });
  const response = await model;
  return response.text;
};

export const getStudyTips = async (subject: string) => {
  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Give me 3 specific, actionable study tips for the subject: ${subject}.`,
  });
  const response = await model;
  return response.text;
};
