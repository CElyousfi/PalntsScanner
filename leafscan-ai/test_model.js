
require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    try {
        // There isn't a direct listModels method on the genAI object in the node SDK generally exposed this way easily
        // without using the model manager or similar. 
        // However, I can try to access the model directly or just print that I'm testing.
        // Actually, usually one checks documentation. But let's try to just run a simple generateContent with the requested model 
        // to see if it works or fails with a useful error, as the SDK might not have a listModels helper exposed in this version.

        // Wait, let's look at the fetch error again: "Call ListModels to see the list of available models and their supported methods."
        // This is an API level instruction. The node SDK might have `genAI.getGenerativeModel` but listing might be via `genAI.getModel`? 
        // Let's rely on grep results first. 

        // Instead of listing, let's just try to invoke the model the user requested and see the specific error or success.
        const model = genAI.getGenerativeModel({ model: "gemini-3-pro-preview" });
        const result = await model.generateContent("Test");
        console.log("Success: " + result.response.text());
    } catch (error) {
        console.error("Error with gemini-3-pro-preview:", error.message);
    }
}

listModels();
