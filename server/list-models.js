import { GoogleGenerativeAI } from "@google/generative-ai";
import 'dotenv/config';

async function listModels() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        
        // Try to generate content with different model names
        const modelNames = ['gemini-1.5-flash-latest', 'gemini-1.5-pro-latest', 'gemini-1.5-flash', 'gemini-pro'];
        
        for (const modelName of modelNames) {
            try {
                console.log(`\nTrying model: ${modelName}`);
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Say hi!");
                console.log(`✅ SUCCESS with ${modelName}`);
                console.log('Response:', result.response.text());
                break;
            } catch (error) {
                console.log(`❌ Failed with ${modelName}:`, error.message.split('\n')[0]);
            }
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

listModels();
