import mongoose from "mongoose";
const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  writer: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  content: {
    type: String,
    required: true,
  },
  create_date: {
    type: Number,
    required: true,
  },
  board: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Board",
  },
  like: {
    type: Number,
    default: 0,
  },
  dislike: {
    type: Number,
    default: 0,
  },
  hits: {
    type: Number,
    default: 0, //조회수
  },
  writer_name: {
    type: String,
  },
  comments_count: {
    type: Number,
    default: 0,
  },
});
const Post = mongoose.model("Post", postSchema);
export default Post;
