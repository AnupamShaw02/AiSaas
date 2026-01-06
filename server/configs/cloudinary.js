import {v2 as cloudinary} from 'cloudinary'

let isCloudinaryConfigured = false;

const connectCloudinary = ()=>{
    if (!isCloudinaryConfigured) {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });
        isCloudinaryConfigured = true;
    }
};

export default connectCloudinary;