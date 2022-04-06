import mongoose from "mongoose";
import moment from "moment";
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    require: true,
    unique: true,
  },
  nickname: {
    type: String,
    require: true,
    maxlength: 18,
  },
  password: {
    type: String,
    require: true,
  },
  // refreshToken: {
  //   type: String,
  // },
  profileImage: {
    type: String,
  },
  signup_date: {
    type: String,
    default: parseInt(moment().format("YYYYMMDDHHmmss")),
  },
  postLock: {
    type: Boolean,
    default: false,
  },
  like_post: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
  dislike_post: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
  bookmark: [{ type: mongoose.Schema.Types.ObjectId, ref: "Board" }],
  scrap_post: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
});
const User = mongoose.model("User", userSchema);
export default User;
