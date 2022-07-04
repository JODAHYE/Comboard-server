import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import userRouter from "./routes/user.js";
import boardRouter from "./routes/board.js";
import postRouter from "./routes/post.js";
import uploadRouter from "./routes/upload.js";
import commentRouter from "./routes/comment.js";
import alertRouter from "./routes/alert.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("mongodb connected"))
  .catch((e) => console.log(e));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());
app.use("/user", userRouter);
app.use("/board", boardRouter);
app.use("/upload", uploadRouter);
app.use("/post", postRouter);
app.use("/comment", commentRouter);
app.use("/alert", alertRouter);
app.listen(PORT, () => console.log(`listen at ${PORT}`));
