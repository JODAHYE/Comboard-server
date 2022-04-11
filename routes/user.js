import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import authMiddleware from "../middleware/auth.js";
import Post from "../models/Post.js";
import Board from "../models/Board.js";
import Comment from "../models/Comment.js";
import axios from "axios";
import qs from "qs";
const userRouter = express.Router();
const saltRounds = 10;
userRouter.post("/signup", (req, res) => {
  try {
    User.findOne({ email: req.body.email }).exec((err, user) => {
      if (err) {
        return res.status(500).json({ success: false, msg: err });
      }
      if (user) {
        return res
          .status(200)
          .json({ success: false, msg: "이미 존재하는 유저입니다." });
      } else {
        const { email, nickname, password } = req.body;
        bcrypt.genSalt(saltRounds, (err, salt) => {
          bcrypt.hash(password, salt, (err, hash) => {
            const newUser = new User({
              email,
              nickname,
              password: hash,
            });
            newUser.save((err, user) => {
              if (err) {
                return res.status(500).json({ success: false, msg: err });
              }
              return res
                .status(201)
                .json({ success: true, msg: "회원가입 성공! 로그인해주세요" });
            });
          });
        });
      }
    });
  } catch (err) {
    return res
      .status(400)
      .json({ success: false, msg: `${err} 올바른 입력이 아닙니다.` });
  }
});
userRouter.post("/login", (req, res) => {
  try {
    User.findOne({ email: req.body.email }).exec((err, user) => {
      if (err) {
        return res.status(500).json({ success: false, msg: err });
      }
      if (!user) {
        return res
          .status(200)
          .json({ success: false, msg: "존재하지 않는 아이디입니다." });
      }
      bcrypt.compare(req.body.password, user.password, (err, result) => {
        if (err) {
          return res.status(500).json({ success: false, msg: err });
        }
        if (!result) {
          return res
            .status(200)
            .json({ success: false, msg: "비밀번호가 일치하지 않습니다." });
        }
        const accessToken = jwt.sign(
          { email: user.email },
          process.env.SECRET_KEY,
          {
            algorithm: "HS256",
            expiresIn: "2h",
          }
        );
        return res.status(200).json({
          success: true,
          accessToken: accessToken,
          msg: "로그인 성공",
        });
      });
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, msg: `${err} 올바른 접근이 아닙니다.` });
  }
});
userRouter.post("/kakaologin", async (req, res) => {
  const param = qs.stringify({
    grant_type: "authorization_code",
    client_id: process.env.REST_API_KEY,
    redirect_uri: process.env.REDIRECT_URL,
    code: req.body.code,
    client_secret: process.env.CLIENT_SECRET,
  });
  const kakaoTokenResponse = await axios.post(
    "https://kauth.kakao.com/oauth/token",
    param
  );
  const kakaoAccessToken = await kakaoTokenResponse.data.access_token;
  // db에 사용자가 없을 경우 (email로 찾음) 저장하고 아니면 새 토큰 발행하기
  const kakaoUserInfoResponse = await axios.get(
    "https://kapi.kakao.com/v2/user/me",
    {
      headers: {
        Authorization: `Bearer ${kakaoAccessToken}`,
      },
    }
  );
  const kakaoUserInfo = await kakaoUserInfoResponse.data;
  const customEmail = kakaoUserInfo.id + "@kakaouser.com";
  User.findOne({ email: customEmail }).exec((err, user) => {
    if (err) return res.status(500).json({ success: false, err });
    if (!user) {
      bcrypt.genSalt(saltRounds, (err, salt) => {
        bcrypt.hash(kakaoUserInfo.id, salt, (err, hash) => {
          const newUser = new User({
            email: customEmail,
            nickname: kakaoUserInfo.properties.nickname,
            password: hash,
          });
          newUser.save((err, user) => {
            if (err) {
              return res.status(500).json({ success: false, msg: err });
            }
          });
        });
      });
    }
    // 토큰 발급
    const accessToken = jwt.sign(
      { email: customEmail },
      process.env.SECRET_KEY,
      {
        algorithm: "HS256",
        expiresIn: "2h",
      }
    );
    return res.status(200).json({
      success: true,
      kakaoAccessToken,
      accessToken,
      kakaoUserInfo,
      msg: "로그인 성공",
    });
  });
});

userRouter.get("/auth", authMiddleware, (req, res) => {
  return res.status(200).json({
    isAuth: true,
    objectId: req.user.objectId,
    email: req.user.email,
    nickname: req.user.nickname,
    like_post: req.user.like_post,
    dislike_post: req.user.dislike_post,
    scrap_post: req.user.scrap_post,
    bookmark: req.user.bookmark,
    profileImage: req.user.profileImage,
    postLock: req.user.postLock,
  });
});
userRouter.get("/logout", authMiddleware, (req, res) => {
  try {
    console.log(req.query.kakaoAccessToken);
    if (req.query.kakaoAccessToken) {
      axios.post("https://kapi.kakao.com/v1/user/unlink", null, {
        headers: {
          Authorization: `Bearer ${req.body.kakaoAccessToken}`,
        },
      });
    }
    return res.status(200).json({ success: true, msg: "로그아웃" });
  } catch (err) {
    console.log("로그아웃 에러: ", err);
    return res
      .status(500)
      .json({ success: false, msg: `${err} 올바른 접근이 아닙니다.` });
  }
});
userRouter.get("/board/created_list", authMiddleware, async (req, res) => {
  try {
    Board.find({ master: req.user.objectId })
      .sort({ create_date: -1 })
      .exec((err, list) => {
        if (err)
          return res.status(500).json({ success: false, msg: `에러 ${err}` });
        else return res.status(200).json({ success: true, list });
      });
  } catch (err) {
    console.log(err);
  }
});
userRouter.patch("/bookmark/add", authMiddleware, (req, res) => {
  try {
    User.findByIdAndUpdate(req.user.objectId, {
      $push: {
        bookmark: req.body.boardId,
      },
    }).exec((err, user) => {
      if (err) {
        return console.log(err);
      }
      return res.status(201).json({
        success: true,
        msg: "게시판 즐겨찾기 업데이트",
      });
    });
  } catch (err) {
    return console.log(err);
  }
});
userRouter.patch("/bookmark/delete", authMiddleware, (req, res) => {
  try {
    User.findByIdAndUpdate(req.user.objectId, {
      $pull: {
        bookmark: req.body.boardId,
      },
    }).exec((err, user) => {
      if (err) {
        return console.log(err);
      }
      return res.status(201).json({
        success: true,
        msg: "게시판 즐겨찾기 업데이트",
      });
    });
  } catch (err) {
    return console.log(err);
  }
});

userRouter.get("/bookmark/list", authMiddleware, async (req, res) => {
  try {
    User.findById(req.user.objectId)
      .populate("bookmark")
      .exec((err, user) => {
        if (err) {
          console.log(err);
        }
        return res.status(200).json({ bookmarkBoardList: user.bookmark });
      });
  } catch (err) {}
});

userRouter.patch("/scrap/add", authMiddleware, async (req, res) => {
  try {
    User.findByIdAndUpdate(req.user.objectId, {
      $push: { scrap_post: req.body.postId },
    }).exec((err, user) => {
      if (err) {
        return console.log(err);
      }
      return res
        .status(201)
        .json({ success: true, msg: "게시글 스크랩", user });
    });
  } catch (err) {
    console.log(err);
  }
});
userRouter.patch("/scrap/delete", authMiddleware, async (req, res) => {
  try {
    User.findByIdAndUpdate(req.user.objectId, {
      $pull: { scrap_post: req.body.postId },
    }).exec((err, user) => {
      if (err) {
        return console.log(err);
      }
      return res
        .status(201)
        .json({ success: true, msg: "게시글 스크랩 해제", user });
    });
  } catch (err) {
    console.log(err);
  }
});

userRouter.get("/post/list", authMiddleware, async (req, res) => {
  try {
    const skip = parseInt(req.query.skip);
    Post.find({ writer: req.user.objectId })
      .sort({ create_date: -1 })
      .limit(18)
      .skip(skip)
      .exec((err, list) => {
        if (err) return console.log(err);
        return res.status(200).json({ success: true, postList: list });
      });
  } catch (err) {
    console.log(err);
  }
});
userRouter.get("/scrap/list", authMiddleware, async (req, res) => {
  try {
    const skip = parseInt(req.query.skip);
    User.findById(req.user.objectId)
      .populate({
        path: "scrap_post",
        options: { limit: 18, sort: { create_date: -1 }, skip: skip },
      })
      .exec((err, user) => {
        if (err) return console.log(err);
        return res
          .status(200)
          .json({ success: true, postList: user.scrap_post });
      });
  } catch (err) {
    console.log(err);
  }
});
userRouter.get("/post_count", authMiddleware, async (req, res) => {
  try {
    Post.countDocuments({ writer: req.user.objectId }).exec((err, count) => {
      if (err) {
        return console.log(err);
      }
      return res.status(200).json({ success: true, postCount: count });
    });
  } catch (err) {
    console.log(err);
  }
});

userRouter.get("/comment/list", authMiddleware, async (req, res) => {
  try {
    const skip = parseInt(req.query.skip);
    Comment.find({ writer: req.user.objectId })
      .populate("post")
      .limit(16)
      .skip(skip)
      .sort({ create_date: -1 })
      .exec((err, list) => {
        if (err) return console.log(err);
        return res.status(200).json({ success: true, list });
      });
  } catch (err) {
    console.log(err);
  }
});
userRouter.get("/comment_count", authMiddleware, async (req, res) => {
  Comment.countDocuments({ writer: req.user.objectId }).exec((err, count) => {
    if (err) {
      return console.log(err);
    }
    return res.status(200).json({ success: true, CommentCount: count });
  });
});
userRouter.patch("/update/image", authMiddleware, (req, res) => {
  User.findByIdAndUpdate(req.user.objectId, {
    profileImage: req.body.imgUrl,
  }).exec((err, user) => {
    if (err) {
      return console.log(err);
    }
    return res
      .status(201)
      .json({ success: true, profileImage: user.profileImage });
  });
});
userRouter.patch("/update/nickname", authMiddleware, (req, res) => {
  User.findByIdAndUpdate(req.user.objectId, {
    nickname: req.body.nickname,
  }).exec((err, user) => {
    if (err) {
      return console.log(err);
    }
    return res.status(201).json({ success: true, nickname: user.nickname });
  });
});
userRouter.patch("/update/post_lock", authMiddleware, (req, res) => {
  User.findByIdAndUpdate(req.user.objectId, {
    postLock: req.body.value,
  }).exec((err, user) => {
    if (err) {
      return console.log(err);
    }
    return res.status(201).json({ success: true, postLock: user.postLock });
  });
});
userRouter.get("/detail", (req, res) => {
  User.findById(req.query.userId).exec((err, user) => {
    Post.countDocuments({ writer: user._id }).exec((err, count) => {
      if (err) {
        return console.log(err);
      }
      return res.status(200).json({
        success: true,
        nickname: user.nickname,
        profileImage: user.profileImage,
        signupDate: user.signup_date,
        count,
        postLock: user.postLock,
      });
    });
  });
});
export default userRouter;
