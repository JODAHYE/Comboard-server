import express from "express";
import Alert from "../models/Alert.js";
import Post from "../models/Post.js";
import authMiddleware from "../middleware/auth.js";

const alertRouter = express.Router();

alertRouter.post("/create", (req, res) => {
  try {
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
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, isAuth: false, msg: `${err}` });
  }
});

alertRouter.post("/create_reply", (req, res) => {
  try {
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
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, isAuth: false, msg: `${err}` });
  }
});

alertRouter.get("/list", authMiddleware, (req, res) => {
  try {
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
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, isAuth: false, msg: `${err}` });
  }
});

alertRouter.patch("/read", authMiddleware, (req, res) => {
  try {
    Alert.findByIdAndUpdate(req.body.alertId, { isRead: true }).exec(
      (err, alert) => {
        if (err) {
          return res.status(500).json({ success: false, msg: err });
        }
        return res.status(200).json({ success: true });
      }
    );
  } catch (err) {
    return res.status(500).json({ success: false, msg: err });
  }
});

alertRouter.delete("/delete", authMiddleware, (req, res) => {
  try {
    Alert.deleteMany({ user: req.user.objectId, isRead: true }).exec(
      (err, result) => {
        if (err) {
          return res.status(500).json({ success: false, msg: err });
        }
        return res.status(200).json({ success: true });
      }
    );
  } catch (err) {
    return res.status(500).json({ success: false, msg: err });
  }
});

alertRouter.get("/count", authMiddleware, (req, res) => {
  try {
    Alert.countDocuments({ user: req.user.objectId, isRead: false }).exec(
      (err, result) => {
        if (err) {
          return res.status(500).json({ success: false, msg: err });
        }
        return res.status(200).json({ success: true, count: result });
      }
    );
  } catch (err) {
    return res.status(500).json({ success: false, msg: err });
  }
});

export default alertRouter;
