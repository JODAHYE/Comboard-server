import express from "express";
import authMiddleware from "../middleware/auth.js";
import Comment from "../models/Comment.js";
import Post from "../models/Post.js";
const commentRouter = express.Router();
commentRouter.post("/create", authMiddleware, (req, res) => {
  try {
    const newComment = new Comment({
      writer: req.user.objectId,
      post: req.body.post,
      writer_name: req.body.nickname,
      content: req.body.content,
      create_date: req.body.createDate,
      childComment: [],
    });
    newComment.save((err, comment) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ success: false, msg: `에러 ${err}` });
      }
      Post.findByIdAndUpdate(req.body.postId, {
        $inc: {
          comments_count: 1,
        },
      }).exec((err, post) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ success: false, msg: `에러 ${err}` });
        }
        return res.status(201).json({
          success: true,
          msg: "댓글생성",
          comments_count: post.comments_count,
        });
      });
    });
  } catch (err) {
    console.log(err);
  }
});
commentRouter.get("/list", (req, res) => {
  Comment.find({ post: req.query.postId })
    .populate("childComment")
    .sort({ create_date: 1 })
    .exec((err, list) => {
      if (err) {
        return res.status(500).json({ success: false, msg: err });
      }
      return res.status(200).json({
        success: true,
        commentList: list,
      });
    });
});
commentRouter.get("/reply/list", (req, res) => {
  Comment.find({ reply_comment: req.query.parentCommentId })
    .sort({ create_date: 1 })
    .exec((err, list) => {
      if (err) {
        return res.status(500).json({ success: false, msg: err });
      }
      return res.status(200).json({
        success: true,
        commentList: list,
      });
    });
});
commentRouter.delete("/delete", authMiddleware, (req, res) => {
  try {
    Comment.findByIdAndDelete(req.query.commentId).exec(() => {
      Comment.deleteMany({ reply_comment: req.query.commentId }).exec(
        (err, result) => {
          if (err) return console.log(err);
          Post.findByIdAndUpdate(req.query.postId, {
            $inc: {
              comments_count: parseInt(`-${result.deletedCount}`) - 1, // 답글 도 같이 삭제
            },
          }).exec((err, post) => {
            if (err) {
              onsole.log(err);
              return res
                .status(500)
                .json({ success: false, msg: `에러 ${err}` });
            }
            return res.status(200).json({
              success: true,
              msg: "댓글 삭제",
              comments_count: post.comments_count,
            });
          });
        }
      );
    });
  } catch (err) {
    console.log(err);
  }
});
commentRouter.patch("/update", authMiddleware, (req, res) => {
  try {
    Comment.findByIdAndUpdate(req.body.commentId, {
      content: req.body.content,
    }).exec((err, comment) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ success: false, msg: `에러 ${err}` });
      }
      return res.status(200).json({
        success: true,
        msg: "댓글 수정",
        comment,
      });
    });
  } catch (err) {
    console.log(err);
  }
});
commentRouter.post("/reply/create", authMiddleware, async (req, res) => {
  try {
    const newReply = new Comment({
      writer: req.user.objectId,
      post: req.body.post,
      writer_name: req.body.nickname,
      content: req.body.content,
      create_date: req.body.createDate,
      reply_user: req.body.reply_user,
      reply_name: req.body.reply_name,
      reply_comment: req.body.reply_comment,
    });

    await newReply.save((err, comment) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ success: false, msg: `에러 ${err}` });
      }
      Comment.findByIdAndUpdate(req.body.parentCommentId, {
        $push: { childComment: comment._id },
      }).exec((err, comment) => {
        if (err) console.log(err);
      });
      Post.findByIdAndUpdate(req.body.postId, {
        $inc: {
          comments_count: 1,
        },
      }).exec((err, post) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ success: false, msg: `에러 ${err}` });
        }
        return res.status(201).json({
          success: true,
          msg: "댓글생성",
          comments_count: post.comments_count,
        });
      });
    });
  } catch (err) {}
});

export default commentRouter;
