const cloudinary = require("cloudinary").v2;
require("dotenv").config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const opts = {
  overwrite: true,
  invalidate: true,
  resource_type: "auto",
  folder: "products",
  timeout: 60000, // زيادة وقت الانتظار إلى 60 ثانية
};

module.exports = (image) => {
  return new Promise((resolve, reject) => {
    if (!image) {
      return reject(new Error("No image provided"));
    }

    // Validate base64 string
    if (typeof image !== "string" || !image.startsWith("data:")) {
      return reject(new Error("Invalid image format. Expected base64 string."));
    }

    // Check for data URL format
    const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return reject(new Error("Invalid base64 image data"));
    }

    // Check image size (max 10MB)
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, "base64");
    if (buffer.length > 10 * 1024 * 1024) {
      return reject(new Error("Image size exceeds 10MB limit"));
    }

    cloudinary.uploader.upload(image, opts, (error, result) => {
      if (error) {
        console.error("Cloudinary upload error:", error);
        return reject(new Error("Failed to upload image to Cloudinary"));
      }
      
      if (result && result.secure_url) {
        return resolve(result.secure_url);
      }
      
      reject(new Error("No URL returned from Cloudinary"));
    });
  });
};