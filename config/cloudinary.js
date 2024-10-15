import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Function to generate signed URLs
export const generateSignedUrl = (publicId, expiresIn) => {
  return cloudinary.video(publicId, {
    sign_url: true,
    expire_at: Math.floor(Date.now() / 1000) + expiresIn, // Expiration time in seconds
  });
};

export default cloudinary;
