import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";

export const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const taskTools: FunctionDeclaration[] = [
  {
    name: "getTasks",
    description: "Get the list of all current tasks.",
    parameters: {
      type: Type.OBJECT,
      properties: {},
    }
  },
  {
    name: "addTask",
    description: "Add a new task to the calendar.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: "The title of the task" },
        date: { type: Type.STRING, description: "The date of the task in YYYY-MM-DD format" },
        time: { type: Type.STRING, description: "The time of the task in HH:mm format (optional)" },
        priority: { type: Type.STRING, description: "Priority: 'high', 'medium', or 'low'" }
      },
      required: ["title", "date"]
    }
  },
  {
    name: "updateTask",
    description: "Update an existing task.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING, description: "The ID of the task to update" },
        title: { type: Type.STRING, description: "New title" },
        date: { type: Type.STRING, description: "New date (YYYY-MM-DD)" },
        time: { type: Type.STRING, description: "New time (HH:mm)" },
        priority: { type: Type.STRING, description: "New priority ('high', 'medium', 'low')" },
        done: { type: Type.BOOLEAN, description: "Whether the task is completed" }
      },
      required: ["id"]
    }
  },
  {
    name: "deleteTask",
    description: "Delete a task by ID.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING, description: "The ID of the task to delete" }
      },
      required: ["id"]
    }
  }
];
