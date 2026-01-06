import express from 'express';
import cors from 'cors';

const app = express()

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        env: {
            hasDatabase: !!process.env.DATABASE_URL,
            hasClerk: !!process.env.CLERK_SECRET_KEY,
            hasGemini: !!process.env.GEMINI_API_KEY,
            hasCloudinary: !!process.env.CLOUDINARY_CLOUD_NAME,
            hasClipdrop: !!process.env.CLIPDROP_API_KEY
        }
    })
})

app.get('/api', (req, res) => {
    res.json({ success: true, message: 'API is running' })
})

// Simple health check
app.get('/health', (req, res) => {
    res.json({ success: true, status: 'healthy' })
})

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: err.message || 'Internal server error',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// Export the Express app for Vercel
export default app;
