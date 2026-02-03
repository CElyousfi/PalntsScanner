const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

async function test() {
    // Manual Env Loading
    let apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        try {
            const envPath = path.resolve(__dirname, '.env');
            if (fs.existsSync(envPath)) {
                const envConfig = fs.readFileSync(envPath, 'utf8');
                const match = envConfig.match(/GEMINI_API_KEY=(.*)/);
                if (match) {
                    apiKey = match[1].trim();
                    console.log("Loaded API Key from .env");
                }
            }
        } catch (e) { console.error(e); }
    }

    if (!apiKey) {
        console.error("No API Key found. Exiting.");
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // Using gemini-2.0-flash-exp (Gemini 3)
    const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash-exp",
        tools: [
            { googleSearch: {} }
            // Code Execution REMOVED to test compatibility
        ]
    });

    try {
        console.log("Sending prompt to Gemini 2.0 (Search Only)...");
        const result = await model.generateContent("Find me 3 organic neem oil suppliers in Casablanca.");
        console.log("Response received.");
        console.log(result.response.text());
    } catch (error) {
        console.error("Error details:", error);
    }
}

test();
