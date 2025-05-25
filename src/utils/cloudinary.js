import {v2 as cloudinary} from 'cloudinary';
import  fs from "fs"; // this is a  node.js module in node for file write read and delecte ,etc.
import dotenv from 'dotenv';

dotenv.config({path: './src/.env'});
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});


//function for uploading files on server and unlink from server after uploading files in CLOUDINARY.
const uploadOnCloudinary = async (localFilePath) =>{
  try {
    //console.log("localFilePath",localFilePath);
    if(!localFilePath) return null;
    //files upload on cloudinary
    const responce=await cloudinary.uploader.upload(localFilePath, {
      resource_type:"auto"
    })
    //console.log("file is uploaded successfully",responce.url);
    //console.log("responce",responce)
    return responce;
  } 
  catch (error) {
    fs.unlinkSync(localFilePath); //delete the local image which we are trying to upload .
    console.log("files not uploaded on cloudinary", error);
    return null;
  }
}


export {uploadOnCloudinary}