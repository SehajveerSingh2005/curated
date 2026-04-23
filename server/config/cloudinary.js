const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const dotenv = require('dotenv');

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('Cloudinary initialized with cloud_name:', cloudinary.config().cloud_name);

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'wardrobe',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 1200, height: 1500, crop: 'limit' }]
  }
});

module.exports = {
  cloudinary,
  storage
};
