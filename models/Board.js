import mongoose from "mongoose";

const boardSchema = new mongoose.Schema({
  master: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  title: {
    type: String,
    required: true,
    default: " ",
  },
  create_date: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    default: "게시판 설명이 없습니다",
  },
  bgimg: {
    type: String,
    default: "이미지 없음",
  },
  access: {
    type: String,
    default: "public",
  },
  secretNumber: {
    type: String,
  },
  postCount: {
    type: Number,
    default: 0,
  },
  lastPostDate: {
    type: Number,
  },
});

const Board = mongoose.model("Board", boardSchema);
export default Board;
