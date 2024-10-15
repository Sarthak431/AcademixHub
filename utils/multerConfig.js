import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'academixhub/videos', // Folder in Cloudinary
    resource_type: 'video',       // Specify resource type as 'video'
  },
});

const upload = multer({ storage });

export default upload;
