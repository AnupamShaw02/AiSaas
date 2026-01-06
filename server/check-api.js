import { GoogleGenerativeAI } from "@google/generative-ai";
import 'dotenv/config';

async function checkAPI() {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        const data = await response.json();
        
        if (data.error) {
            console.log('❌ API Error:', data.error.message);
            console.log('\nThe Generative Language API is not enabled for this API key.');
            console.log('\nTo fix this:');
            console.log('1. Go to: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com');
            console.log('2. Make sure you select the correct project');
            console.log('3. Click "Enable"');
            console.log('4. Wait a few minutes for it to activate');
        } else if (data.models) {
            console.log('✅ API is enabled! Available models:');
            data.models.forEach(model => {
                console.log(`  - ${model.name}`);
            });
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkAPI();
