import express from "express";
import { v2 } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import dotenv from "dotenv";
dotenv.config();
const uploadRouter = express.Router();
v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
  secure: true,
});
const imgStorage = new CloudinaryStorage({
  cloudinary: v2,
  params: {
    folder: "Comboard",
    public_id: (req, file) => `${Date.now()}_${file.originalname}`,
  },
});
const imgUpload = multer({ storage: imgStorage });
const videoStorage = new CloudinaryStorage({
  cloudinary: v2,
  params: {
    folder: "Comboard-video",
    format: "mp4",
    resource_type: "video",
    public_id: (req, file) => `${Date.now()}_${file.originalname}`,
  },
});
const videoUpload = multer({ storage: videoStorage });

uploadRouter.post("/image", imgUpload.single("file"), (req, res) => {
  try {
    return res.status(201).json({ success: true, img_url: req.file.path });
  } catch (err) {
    console.log(err);
  }
});
uploadRouter.post("/video", videoUpload.single("file"), (req, res) => {
  try {
    return res.status(201).json({ success: true, video_url: req.file.path });
  } catch (err) {
    console.log(err);
  }
});
export default uploadRouter;
