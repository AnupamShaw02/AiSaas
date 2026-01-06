import express from "express";
import { generateArticle, generateImage, generateBlogTitle, removeImageBackground, removeImageObject, resumeReview, getPublishedImages, getUserCreations, toggleLike } from "../controllers/aiControllers.js";
import { requirePremiumPlan, requireAuth, optionalAuth } from "../middlewares/auth.js";
import { upload } from "../configs/multer.js";

const aiRouter = express.Router();

aiRouter.post('/generate-article', requirePremiumPlan, generateArticle);
aiRouter.post('/generate-image', requirePremiumPlan, generateImage);
aiRouter.post('/generate-blog-title', requirePremiumPlan, generateBlogTitle);
aiRouter.post('/remove-image-background', upload.single('image'), requirePremiumPlan, removeImageBackground);
aiRouter.post('/remove-image-object', upload.single('image'), requirePremiumPlan, removeImageObject);
aiRouter.post('/resume-review', upload.single('resume'), requirePremiumPlan, resumeReview );
aiRouter.get('/published-images', optionalAuth, getPublishedImages);
aiRouter.post('/toggle-like', requireAuth, toggleLike);
aiRouter.get('/user-creations', requirePremiumPlan, getUserCreations);

export default aiRouter