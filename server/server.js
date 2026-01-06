import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { clerkMiddleware, requireAuth } from '@clerk/express'
import aiRouter from './routes/aiRoutes.js';
import connectCloudinary from './configs/cloudinary.js';
import userRouter from './routes/userRoutes.js';

const app = express()

await connectCloudinary()

app.use(cors())
app.use(express.json())
app.use(clerkMiddleware())

app.get('/', (req, res) => res.send('Server is running'))

// Public routes (no auth required)
app.get('/api/ai/published-images', (req, res, next) => {
    // Import and call the controller directly for this public route
    import('./controllers/aiControllers.js').then(module => {
        module.getPublishedImages(req, res)
    }).catch(next)
})

// Protected routes (auth required)
app.use(requireAuth())

app.use('/api/ai', aiRouter)
app.use('/api/user', userRouter)

const PORT = process.env.PORT  || 3000;

app.listen(PORT, ()=>{
    console.log(`Server is running on port ${ PORT}`)
})