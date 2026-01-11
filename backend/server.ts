import { GoogleGenerativeAI } from "@google/generative-ai";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

if (!process.env.GEMINI_API_KEY) {
    console.warn("WARNING: No Gemini API Key found in environment variables!");
} else {
    console.log("Gemini API Key loaded.");
}

app.use(cors());
app.use(express.json());

interface ChatRequest {
    message: string;
    personality: "Encourager" | "Explorer" | "Goal Finisher";
    daysUsed: number;
    lifestyle: {
        steps: number;
        sleep: number;
        exerciseMinutes: number;
    };
}

app.head("/", (req: express.Request, res: express.Response): void => {
    res.status(200).send();
});


app.post("/chat", async (req: express.Request, res: express.Response): Promise<void> => {
    const { message, personality, daysUsed, lifestyle }: ChatRequest = req.body;

    try {
        const forbiddenTopics = ["injury", "disease", "medication", "doctor", "pain", "medical"];
        const lowerMessage = message.toLowerCase();
        if (forbiddenTopics.some(topic => lowerMessage.includes(topic))) {
            const safetyResponse = "I cannot provide medical advice or guidance on injuries. Please consult a healthcare professional.";

            await prisma.chat.create({
                data: { role: "user", content: message },
            });
            await prisma.chat.create({
                data: { role: "ai", content: safetyResponse },
            });

            res.json({ response: safetyResponse });
            return;
        }

        let systemTone = "";

        if (daysUsed <= 3) {
            systemTone = "You are an empathetic listener. Allow the user to vent. Do not offer instant fixes. Be supportive and patient.";
        } else if (daysUsed <= 8) {
            systemTone = "You are a friendly friend. Listen well, but offer short, practical tips. Keep it light and encouraging.";
        } else {
            systemTone = "You are a strict but fair coach. Be direct. specific, and actionable. Focus on results and discipline.";
        }

        const systemPrompt = `
        You are a fitness AI companion.
        Current User Context:
        - Personality Preference: ${personality}
        - Days Using App: ${daysUsed}
        - Recent Lifestyle: ${JSON.stringify(lifestyle)}
        
        Tone Instructions: ${systemTone}
        
        IMPORTANT: refusal to answer medical questions is handled by the server, but if one slips through, refuse it politely.
        `;

        const finalPrompt = `${systemPrompt}\n\nUser Message: ${message}`;

        const result = await model.generateContent(finalPrompt);
        const aiResponse = result.response.text();

        await prisma.chat.create({
            data: { role: "user", content: message },
        });

        await prisma.chat.create({
            data: { role: "ai", content: aiResponse },
        });

        res.json({ response: aiResponse });

    } catch (error: any) {
        console.error("Error processing chat:", error);
        console.error("Gemini Status:", error.status);
        console.error("Gemini Message:", error.message);

        if (error) {
            console.log("Gemini API Error. Using Mock Fallback.");

            let mockResponse = "";
            if (daysUsed <= 3) {
                mockResponse = "I hear you. It's tough getting started, but simply showing up is a win. How are you feeling right now? (Mock: Empathetic)";
            } else if (daysUsed <= 8) {
                mockResponse = "You're doing great! Try drinking a glass of water and stretching for 5 minutes. Small wins! (Mock: Friendly)";
            } else {
                mockResponse = "No excuses. You have a goal. Stick to the plan and get it done. What's your next set? (Mock: Coach)";
            }

            try {
                await prisma.chat.create({ data: { role: "user", content: message } });
                await prisma.chat.create({ data: { role: "ai", content: mockResponse } });
            } catch (dbError) {
                console.error("DB Error during fallback:", dbError);
            }

            res.json({ response: mockResponse });
            return;
        }

        res.status(500).json({ error: "Internal Server Error" });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
