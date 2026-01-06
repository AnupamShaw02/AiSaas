
import { GoogleGenerativeAI } from "@google/generative-ai";
import sql from "../configs/db.js";
import {clerkClient } from "@clerk/express";
import { response } from "express";
import {v2 as cloudinary} from 'cloudinary'
import axios from "axios";
import FormData from "form-data";
import pdfParse from 'pdf-parse';
import connectCloudinary from "../configs/cloudinary.js";

// Lazy initialize Gemini AI to avoid crashes on module load
let model = null;
const getGeminiModel = () => {
    if (!model) {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    }
    return model;
};

export const generateArticle = async (req, res)=>{
    try{
        const { userId } = req.auth();
        const {prompt, length} = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        if(plan !== 'premium' && free_usage >= 10){
            return res.json({success: false, message: "Free usage limit exceeded. Upgrade to premium."})
        }

        // Use Gemini to generate article
        const result = await getGeminiModel().generateContent(prompt);
        const content = result.response.text();

     await sql`INSERT INTO articles (user_id, prompt, content, type) VALUES (${userId}, ${prompt}, ${content}, 'article')`;

     if (plan !== 'premium') {
        await clerkClient.users.updateUserMetadata(userId, {
            privateMetadata: {
                free_usage: free_usage + 1
            }
        })
     }
     res.json({success: true,content})

    }catch (error){
        console.error('generateArticle error:', error);

        // Handle rate limit errors specifically
        if (error.status === 429 || error.message?.includes('quota')) {
            return res.status(429).json({
                success: false,
                message: "API rate limit exceeded. Please try again in a few minutes."
            });
        }

        res.status(500).json({success: false, message: error.message})
    }
}


export const generateImage = async (req, res)=>{
    try{
        connectCloudinary(); // Ensure Cloudinary is configured

        const { userId } = req.auth();
        const {prompt, publish} = req.body;
        const plan = req.plan;

        if(plan !== 'premium' ){
            return res.json({success: false, message: "Upgrade to premium."})
        }

        // Use Clipdrop API for image generation
        const formData = new FormData();
        formData.append('prompt', prompt);

        const {data} = await axios.post("https://clipdrop-api.co/text-to-image/v1", formData, {
            headers: {
                'x-api-key': process.env.CLIPDROP_API_KEY,
                ...formData.getHeaders()
            },
            responseType: "arraybuffer"
        });

        const base64Image = `data:image/png;base64,${Buffer.from(data).toString('base64')}`;

        // Upload to Cloudinary for storage
        const {secure_url} = await cloudinary.uploader.upload(base64Image);

        await sql`INSERT INTO creations (user_id, prompt, content, type, publish) VALUES (${userId}, ${prompt}, ${secure_url}, 'image', ${publish ?? false})`;

        res.json({success: true, content: secure_url})

    }catch (error){
        console.error('generateImage error:', error);

        // Handle rate limit errors specifically
        if (error.status === 429 || error.message?.includes('quota') || error.response?.status === 429) {
            return res.status(429).json({
                success: false,
                message: "API rate limit exceeded. Please try again in a few minutes."
            });
        }

        res.status(500).json({success: false, message: error.message || error.response?.data?.error?.message || 'Image generation failed'})
    }
}

export const generateBlogTitle = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { prompt } = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        if (plan !== 'premium' && free_usage >= 10) {
            return res.json({ success: false, message: "Free usage limit exceeded. Upgrade to premium." })
        }

        // Use Gemini to generate blog titles
        const enhancedPrompt = `You are a creative blog title generator. ${prompt} Generate 5 catchy, SEO-friendly blog titles. Return only the titles, numbered 1-5.`;
        const result = await getGeminiModel().generateContent(enhancedPrompt);
        const titles = result.response.text();

        await sql`INSERT INTO creations (user_id, prompt, content, type, publish) VALUES (${userId}, ${prompt}, ${titles}, 'blog-title', false)`;

        if (plan !== 'premium') {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
                    free_usage: free_usage + 1
                }
            })
        }

        res.json({ success: true, content: titles })

    } catch (error) {
        console.error('generateBlogTitle error:', error);

        if (error.status === 429 || error.message?.includes('quota')) {
            return res.status(429).json({
                success: false,
                message: "API rate limit exceeded. Please try again in a few minutes."
            });
        }

        res.status(500).json({ success: false, message: error.message })
    }
}




export const removeImageBackground = async (req, res)=>{
    try{
        connectCloudinary(); // Ensure Cloudinary is configured

        const { userId } = req.auth();
        const image= req.file;

        const plan = req.plan;

        if(plan !== 'premium' ){
            return res.json({success: false, message: "Upgrade to premium."})
        }

        // Convert buffer to base64 for serverless compatibility
        const base64Image = `data:${image.mimetype};base64,${image.buffer.toString('base64')}`;
        const {secure_url} = await cloudinary.uploader.upload(base64Image, {
            transformation: [
                {
                    effect: 'background_removal',
                    background_removal: 'remove the background'
                }
            ]
        })

     await sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, 'Remove background', ${secure_url}, 'image')`;


     res.json({success: true,content: secure_url})

    }catch (error){
        console.error('generateImage error:', error);

        // Handle rate limit errors specifically
        if (error.status === 429) {
            return res.status(429).json({
                success: false,
                message: "API rate limit exceeded. Please try again in a few minutes."
            });
        }

        res.status(500).json({success: false, message: error.message})
    }
}


export const removeImageObject = async (req, res)=>{
    try{
        connectCloudinary(); // Ensure Cloudinary is configured

        const { userId } = req.auth();
        const { object } = req.body;
        const image = req.file;

        const plan = req.plan;

        if(plan !== 'premium' ){
            return res.json({success: false, message: "Upgrade to premium."})
        }

        // Convert buffer to base64 for serverless compatibility
        const base64Image = `data:${image.mimetype};base64,${image.buffer.toString('base64')}`;
        const {public_id} = await cloudinary.uploader.upload(base64Image)

        const image_url = cloudinary.url(public_id,{
            transformation: [{effect: `gen_remove:${object}`}],
            resource_type: 'image'
        })

     await sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${`Removed ${object} from image`}, ${image_url}, 'image')`;


     res.json({success: true,content: image_url})

    }catch (error){
        console.error('generateImage error:', error);

        // Handle rate limit errors specifically
        if (error.status === 429) {
            return res.status(429).json({
                success: false,
                message: "API rate limit exceeded. Please try again in a few minutes."
            });
        }

        res.status(500).json({success: false, message: error.message})
    }
}


export const resumeReview = async (req, res)=>{
    try{
        const { userId } = req.auth();
        const resume = req.file;

        const plan = req.plan;

        if(plan !== 'premium' ){
            return res.json({success: false, message: "Upgrade to premium."})
        }

        if(resume.size > 5 * 1024 * 1024){
            return res.status(400).json({success: false, message: "File size exceeds 5MB limit."})
        }

        // Use buffer directly for serverless compatibility (no file path in serverless)
        const pdfData = await pdfParse(resume.buffer);

        const prompt = `Review the resume and provide feedback on clarity, structure, and professionalism. Resume Content:\n\n${pdfData.text}`

        // Use Gemini to review resume
        const result = await getGeminiModel().generateContent(prompt);
        const content = result.response.text();

     await sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, 'Review the resume and provide feedback on clarity, structure, and professionalism.', ${content}, 'resume-review')`;

     res.json({success: true, content: content})

    }catch (error){
        console.error('resumeReview error:', error);

        // Handle rate limit errors specifically
        if (error.status === 429 || error.message?.includes('quota')) {
            return res.status(429).json({
                success: false,
                message: "API rate limit exceeded. Please try again in a few minutes."
            });
        }

        res.status(500).json({success: false, message: error.message})
    }
}

export const getPublishedImages = async (req, res) => {
    try {
        const publishedImages = await sql`
            SELECT id, user_id, prompt, content, created_at
            FROM creations
            WHERE publish = true AND type = 'image'
            ORDER BY created_at DESC
        `;

        // Get user information from Clerk for each image
        const imagesWithUserInfo = await Promise.all(
            publishedImages.map(async (image) => {
                try {
                    const user = await clerkClient.users.getUser(image.user_id);
                    return {
                        id: image.id,
                        imageUrl: image.content,
                        prompt: image.prompt,
                        createdAt: image.created_at,
                        user: {
                            id: user.id,
                            name: user.firstName && user.lastName
                                ? `${user.firstName} ${user.lastName}`
                                : user.username || 'Anonymous',
                            avatar: user.imageUrl
                        }
                    };
                } catch (error) {
                    console.error('Error fetching user:', error);
                    return {
                        id: image.id,
                        imageUrl: image.content,
                        prompt: image.prompt,
                        createdAt: image.created_at,
                        user: {
                            id: image.user_id,
                            name: 'Anonymous',
                            avatar: null
                        }
                    };
                }
            })
        );

        res.json({ success: true, images: imagesWithUserInfo });

    } catch (error) {
        console.error('getPublishedImages error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
}

export const getUserCreations = async (req, res) => {
    try {
        const { userId } = req.auth();

        // Fetch all creations from creations table
        const creations = await sql`
            SELECT id, user_id, prompt, content, type, publish, created_at
            FROM creations
            WHERE user_id = ${userId}
            ORDER BY created_at DESC
        `;

        // Fetch all articles from articles table
        const articles = await sql`
            SELECT id, user_id, prompt, content, type, created_at
            FROM articles
            WHERE user_id = ${userId}
            ORDER BY created_at DESC
        `;

        // Combine and sort by date
        const allCreations = [...creations, ...articles].sort((a, b) =>
            new Date(b.created_at) - new Date(a.created_at)
        );

        res.json({ success: true, creations: allCreations });

    } catch (error) {
        console.error('getUserCreations error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
}