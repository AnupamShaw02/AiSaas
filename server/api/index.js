import express from 'express';
import cors from 'cors';
import { clerkMiddleware, requireAuth } from '@clerk/express'

const app = express()

app.use(cors())
app.use(express.json())
app.use(clerkMiddleware())

app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
    })
})

app.get('/api', (req, res) => {
    res.json({ success: true, message: 'API is running' })
})

// Health check
app.get('/health', (req, res) => {
    res.json({ success: true, status: 'healthy' })
})

// Lazy load routes to avoid initialization issues
app.use('/api/ai', async (req, res, next) => {
    try {
        const { default: aiRouter } = await import('../routes/aiRoutes.js');
        aiRouter(req, res, next);
    } catch (error) {
        console.error('Error loading AI routes:', error);
        next(error);
    }
});

app.use('/api/user', async (req, res, next) => {
    try {
        const { default: userRouter } = await import('../routes/userRoutes.js');
        userRouter(req, res, next);
    } catch (error) {
        console.error('Error loading user routes:', error);
        next(error);
    }
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// Export the Express app for Vercel
export default app;
