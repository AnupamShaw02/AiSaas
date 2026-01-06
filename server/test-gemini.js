import { GoogleGenerativeAI } from "@google/generative-ai";
import 'dotenv/config';

async function testGeminiAPI() {
    try {
        console.log('Testing Gemini API with gemini-2.5-flash...');
        console.log('API Key:', process.env.GEMINI_API_KEY ? 'Present' : 'Missing');

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const result = await model.generateContent("Say hello in one sentence!");
        const response = result.response.text();

        console.log('\n✅ SUCCESS! Gemini API is working!');
        console.log('Response:', response);
        console.log('\nYour AI features are now ready to use!');

    } catch (error) {
        console.error('\n❌ ERROR: Gemini API test failed');
        console.error('Error message:', error.message);
    }
}

testGeminiAPI();
