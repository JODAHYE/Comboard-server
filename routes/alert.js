import express from "express";
import Alert from "../models/Alert.js";
import Post from "../models/Post.js";
import authMiddleware from "../middleware/auth.js";
const alertRouter = express.Router();
alertRouter.post("/create", (req, res) => {
  Post.findById(req.body.postId).exec((err, post) => {
    const newAlert = new Alert({
      user: post.writer,
      createDate: req.body.createDate,
      description: req.body.description,
      detailUrl: req.body.detailUrl,
      subdescription: req.body.subdescription,
    });
    newAlert.save((err, alert) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ success: false, msg: `${err}` });
      }
      return res.status(201).json({ success: true, msg: "알림 생성" });
    });
  });
});
alertRouter.post("/create_reply", (req, res) => {
  const newAlert = new Alert({
    user: req.body.replyUser,
    createDate: req.body.createDate,
    description: req.body.description,
    detailUrl: req.body.detailUrl,
    subdescription: req.body.subdescription,
  });
  newAlert.save((err, alert) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ success: false, msg: err });
    }
    return res.status(201).json({ success: true, msg: "알림 생성" });
  });
});
alertRouter.get("/list", authMiddleware, (req, res) => {
  Alert.find({ user: req.user.objectId })
    .sort({ createDate: -1 })
    .limit(11)
    .skip(req.query.skip)
    .exec((err, list) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ success: false, msg: err });
      }
      return res.status(200).json({ success: true, list });
    });
});
alertRouter.patch("/read", authMiddleware, (req, res) => {
  Alert.findByIdAndUpdate(req.body.alertId, { isRead: true }).exec(
    (err, alert) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ success: false, msg: err });
      }
      return res.status(200).json({ success: true });
    }
  );
});
alertRouter.delete("/delete", authMiddleware, (req, res) => {
  Alert.deleteMany({ user: req.user.objectId, isRead: true }).exec(
    (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ success: false, msg: err });
      }
      return res.status(200).json({ success: true });
    }
  );
});
alertRouter.get("/count", authMiddleware, (req, res) => {
  Alert.countDocuments({ user: req.user.objectId, isRead: false }).exec(
    (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ success: false, msg: err });
      }
      return res.status(200).json({ success: true, count: result });
    }
  );
});

export default alertRouter;
