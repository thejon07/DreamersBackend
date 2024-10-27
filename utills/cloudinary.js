const { v2 } = require('cloudinary');
const fs = require("fs");

// Configure Cloudinary with environment variables
v2.config({
  cloud_name:'dz1yruhjg',
  api_key:"624712247312371",
  api_secret:"7EwirbuGMDnKQicMPoyaNjzN39k"
});

// Upload function
const uploadOnCloudinary = async (localfilepath) => {
  try {
    if (!localfilepath) return null;

    // Use the correct uploader method and await the promise
    const result = await v2.uploader.upload(localfilepath, {
      resource_type: "auto"
    });

    console.log("File uploaded successfully to Cloudinary:", result.url);
    
    // Delete the local file after successful upload
    fs.unlinkSync(localfilepath);

    return result;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error.message);
    
    // Remove the locally saved temporary file if the upload operation fails
    fs.unlinkSync(localfilepath);
    return null;
  }
};

module.exports = uploadOnCloudinary;
