
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log("Fetching available models...");

    try {
        // Note: older SDKs might not expose listModels directly on the main class helper
        // If this fails, we can use a direct fetch.
        // But usually genAI.getGenerativeModel is the entry.
        // Actually, accessing model listing usually requires the ModelService or just trying known ones.
        // The error message explicitely said: "Call ListModels to see the list..."
        // In the Node SDK, it doesn't always expose a simple list function. 
        // Let's try to hit the REST API directly to be sure.

        const key = process.env.GEMINI_API_KEY;
        if (!key) throw new Error("GEMINI_API_KEY not set");

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        const data = await response.json();

        if (data.models) {
            console.log("\n=== AVAILABLE MODELS ===");
            data.models.forEach(m => {
                console.log(`- ${m.name} (${m.supportedGenerationMethods.join(', ')})`);
            });
            console.log("========================\n");
        } else {
            console.log("No models found or error:", data);
        }

    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
