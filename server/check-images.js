import sql from "./configs/db.js";
import 'dotenv/config';

async function checkImages() {
    try {
        console.log('Checking images in database...\n');

        const allImages = await sql`
            SELECT id, user_id, prompt, type, publish, created_at
            FROM creations
            WHERE type = 'image'
            ORDER BY created_at DESC
        `;

        console.log('Total images:', allImages.length);
        console.log('\nAll images:');
        allImages.forEach(img => {
            console.log(`- ID: ${img.id}, Published: ${img.publish}, Prompt: ${img.prompt.substring(0, 50)}...`);
        });

        const publishedImages = await sql`
            SELECT id, user_id, prompt, type, publish, created_at
            FROM creations
            WHERE type = 'image' AND publish = true
            ORDER BY created_at DESC
        `;

        console.log('\n\nPublished images:', publishedImages.length);
        if (publishedImages.length > 0) {
            console.log('Published images:');
            publishedImages.forEach(img => {
                console.log(`- ID: ${img.id}, User: ${img.user_id}, Prompt: ${img.prompt}`);
            });
        } else {
            console.log('No published images found. Make sure to check "Publish to community" when generating images.');
        }

    } catch (error) {
        console.error('Error:', error);
    }
    process.exit(0);
}

checkImages();
