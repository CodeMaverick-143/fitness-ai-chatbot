const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const OpenAI = require('openai');

const app = express();
const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors());
app.use(express.json());


const generateSystemPrompt = (personality, daysUsed, lifestyle) => {
    let tone = "neutral";
    if (daysUsed <= 3) {
        tone = "empathetic, grounded, allow venting."
    } else if (daysUsed <= 8) {
        tone = "friendly listener, short remedies."
    } else {
        tone = "coach-like, actionable guidance immediately."
    };

    return `
    You are a fitness companion.
    User Personality: ${personality}
    User Stats: Used app ${daysUsed} days.
    Lifestyle: Steps ${lifestyle.steps}, Sleep ${lifestyle.sleep}h.
    TONE: ${tone}

    CRITICAL RULES:
    1. REFUSE medical/injury questions.
    2. Keep answers structured (bullet points).
  `;
};

app.post('/chat', async (req, res) => {
    const { message, personality, daysUsed, lifestyle } = req.body;

    try {

        const systemPrompt = generateSystemPrompt(personality, daysUsed, lifestyle);
        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: message }
            ],
            model: "gpt-3.5-turbo",
        });

        const aiResponse = completion.choices[0].message.content;

        await prisma.chat.create({
            data: {
                user_message: message,
                ai_response: aiResponse,
            },
        });

        res.json({ response: aiResponse });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
