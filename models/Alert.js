import mongoose from "mongoose";
const alertSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  createDate: {
    type: Number,
  },
  description: {
    type: String,
    required: true,
  },
  subdescription: {
    type: String,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  detailUrl: {
    type: String,
  },
});

const Alert = mongoose.model("Alert", alertSchema);
export default Alert;
