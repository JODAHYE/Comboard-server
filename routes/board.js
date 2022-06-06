import express from "express";
import Board from "../models/Board.js";
import authMiddleware from "../middleware/auth.js";
import Post from "../models/Post.js";

const boardRouter = express.Router();

boardRouter.post("/create", authMiddleware, (req, res) => {
  try {
    Board.findOne({ title: req.body.title }).exec((err, board) => {
      if (err) {
        return res.status(500).json({ success: false, msg: err });
      }
      if (board) {
        return res
          .status(200)
          .json({ success: false, msg: "이미 존재하는 게시판입니다" });
      } else {
        const {
          master,
          title,
          description,
          bgimg,
          access,
          secretNumber,
          creatDate,
        } = req.body;
        const newBoard = new Board({
          master,
          title,
          description,
          bgimg,
          access,
          secretNumber,
          create_date: creatDate,
        });
        newBoard.save((err, board) => {
          if (err) {
            console.log(err);
            return res.status(500).json({ success: false, msg: err });
          }
          return res.status(201).json({
            success: true,
            msg: "게시판을 생성하였습니다",
            board: board,
          });
        });
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, msg: `에러 ${err}` });
  }
});

boardRouter.post("/update", authMiddleware, (req, res) => {
  try {
    Board.findOne({ title: req.body.title }).exec((err, board) => {
      if (err) {
        return res.status(500).json({ success: false, msg: err });
      }
      if (board) {
        return res
          .status(200)
          .json({ success: false, msg: "이미 존재하는 이름의 게시판입니다" });
      } else {
        const { master, title, description, bgimg, access, secretNumber } =
          req.body;
        Board.findByIdAndUpdate(req.query.boardId, {
          master,
          title,
          description,
          bgimg,
          access,
          secretNumber,
        }).exec((err, board) => {
          if (err) {
            console.log(err);
            return res.status(500).json({ success: false, msg: err });
          }
          return res.status(201).json({
            success: true,
            msg: "게시판을 수정하였습니다",
            board: board,
          });
        });
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, msg: `에러 ${err}` });
  }
});

boardRouter.get("/search", (req, res) => {
  try {
    Board.findOne({ access: req.query.access, title: req.query.title }).exec(
      (err, board) => {
        if (err)
          return res.status(500).json({ success: false, msg: `에러 ${err}` });
        else return res.status(200).json({ success: true, board });
      }
    );
  } catch (err) {
    console.log(err);
  }
});

boardRouter.get("/list", (req, res) => {
  try {
    if (req.query.access === "private") {
      Board.find({ access: req.query.access })
        .sort({ create_date: -1 })
        .exec((err, list) => {
          if (err)
            return res.status(500).json({ success: false, msg: `에러 ${err}` });
          else return res.status(200).json({ success: true, list });
        });
    } else {
      Board.find({ access: req.query.access })
        .limit(8)
        .skip(req.query.skip)
        .sort({ create_date: -1 })
        .exec((err, list) => {
          if (err)
            return res.status(500).json({ success: false, msg: `에러 ${err}` });
          else return res.status(200).json({ success: true, list });
        });
    }
  } catch (err) {
    return res.status(500).json({ success: false, msg: `에러 ${err}` });
  }
});

boardRouter.get("/:id", (req, res) => {
  try {
    Board.findById(req.params.id).exec((err, board) => {
      if (err)
        return res.status(500).json({ success: false, msg: `에러 ${err}` });
      if (board) {
        return res.status(200).json({ success: true, board });
      } else {
        return res
          .status(200)
          .json({ success: false, msg: "존재하지 않는 게시판입니다." });
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, msg: `에러 ${err}` });
  }
});

boardRouter.delete("/delete", authMiddleware, (req, res) => {
  try {
    Board.findOneAndRemove({
      master: req.user.objectId,
      _id: req.query.boardId,
    }).exec((err, board) => {
      if (err) {
        return res.status(500).json({ success: false, msg: `에러 ${err}` });
      }
      return res.status(200).json({ success: true, msg: "게시판 삭제" });
    });
  } catch (err) {
    return res.status(500).json({ success: false, msg: `에러 ${err}` });
  }
});

export default boardRouter;
