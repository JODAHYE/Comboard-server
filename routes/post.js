import express from "express";
import authMiddleware from "../middleware/auth.js";
import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import User from "../models/User.js";
import Board from "../models/Board.js";
import moment from "moment";
const postRouter = express.Router();

postRouter.post("/create", authMiddleware, (req, res) => {
  try {
    const newPost = new Post(req.body);
    newPost.save((err, post) => {
      Board.findByIdAndUpdate(req.body.board, {
        $inc: {
          postCount: 1,
        },
        lastPostDate: moment().format("YYYYMMDD"),
      }).exec(() => {
        if (err) {
          console.log(err);
          return res.status(500).json({ success: false, msg: err });
        }
        return res.status(201).json({
          success: true,
          msg: "게시글을 작성하였습니다.",
          post: post,
        });
      });
    });
  } catch (err) {
    return res.status(500).json({ success: false, msg: `에러 ${err}` });
  }
});
postRouter.patch("/update", authMiddleware, (req, res) => {
  try {
    Post.findByIdAndUpdate(req.query.postId, req.body).exec((err, post) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ success: false, msg: err });
      }
      return res.status(201).json({
        success: true,
        msg: "게시글을 수정하였습니다.",
        post: post,
      });
    });
  } catch (err) {
    return res.status(500).json({ success: false, msg: `에러 ${err}` });
  }
});
postRouter.delete("/delete", authMiddleware, async (req, res) => {
  try {
    Post.findByIdAndDelete(req.query.postId).exec(() => {
      Board.findByIdAndUpdate(req.query.boardId, {
        $inc: {
          postCount: -1,
        },
      }).exec(() => {
        Comment.deleteMany({ post: req.query.postId }).exec((err, result) => {
          //댓글도 삭제
          if (err) {
            console.log(err);
            return res.status(500).json({ success: false, msg: err });
          }
          return res.status(201).json({
            success: true,
            msg: "게시글을 삭제하였습니다.",
          });
        });
      });
    });
  } catch (err) {
    return res.status(500).json({ success: false, msg: `에러 ${err}` });
  }
});
postRouter.get("/get", (req, res) => {
  try {
    Post.findById(req.query.postId).exec((err, post) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ success: false, msg: err });
      }
      if (post) {
        return res.status(200).json({
          success: true,
          post: post,
        });
      } else {
        return res.status(200).json({
          success: false,
          msg: "존재하지 않는 글 입니다.",
          post: post,
        });
      }
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, msg: `에러 ${err}` });
  }
});
postRouter.patch("/increase/view", (req, res) => {
  try {
    Post.findByIdAndUpdate(req.body.postId, { $inc: { hits: 1 } }).exec(
      (err, post) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ success: false, msg: err });
        }
        return res.status(200).json({
          success: true,
          post: post,
        });
      }
    );
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, msg: `에러 ${err}` });
  }
});
postRouter.patch("/like", authMiddleware, (req, res) => {
  try {
    User.findByIdAndUpdate(req.user.objectId, {
      $push: {
        like_post: req.body.postId,
      },
    }).exec(() => {
      Post.findByIdAndUpdate(req.body.postId, { $inc: { like: 1 } }).exec(
        (err, post) => {
          if (err) {
            console.log(err);
            return res.status(500).json({ success: false, msg: err });
          }
          return res.status(201).json({
            success: true,
            msg: "추천",
            post: post,
          });
        }
      );
    });
  } catch (err) {
    return console.log(err);
  }
});

postRouter.patch("/dislike", authMiddleware, (req, res) => {
  try {
    User.findByIdAndUpdate(req.user.objectId, {
      $push: {
        dislike_post: req.body.postId,
      },
    }).exec(() => {
      Post.findByIdAndUpdate(req.body.postId, {
        $inc: { dislike: 1 },
      }).exec((err, post) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ success: false, msg: err });
        }
        return res.status(201).json({
          success: true,
          msg: "비추",
          post: post,
        });
      });
    });
  } catch (err) {
    return console.log(err);
  }
});
postRouter.get("/user_list", (req, res) => {
  Post.find({ writer: req.query.userId })
    .skip(req.query.skip)
    .limit(3)
    .sort({ create_date: -1 })
    .exec((err, list) => {
      if (err) return console.log(err);
      if (list && list.length > 0) {
        return res.status(200).json({ success: true, postList: list });
      }
      if (!list || list.length === 0) {
        return res
          .status(200)
          .json({ success: false, msg: "게시글이 없습니다." });
      }
    });
});
export default postRouter;
