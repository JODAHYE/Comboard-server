import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  writer: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Post",
  },
  writer_name: {
    type: String,
  },
  content: {
    type: String,
  },
  create_date: {
    type: Number,
    required: true,
  },
  reply_user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  reply_name: {
    type: String,
  },
  reply_comment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment",
  },
  childComment: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
});

const Comment = mongoose.model("Comment", commentSchema);
export default Comment;
