import jwt from "jsonwebtoken";
import User from "../models/User.js";
const authMiddleware = (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return res
        .status(403)
        .json({ success: false, isAuth: false, msg: "토큰이 존재하지 않음" });
    }
    jwt.verify(
      req.headers.authorization,
      process.env.SECRET_KEY,
      (err, decoded) => {
        User.findOne({ email: decoded.email }, (err, user) => {
          if (!user)
            return res.status(500).json({
              success: false,
              isAuth: false,
              msg: "유저를 찾지 못함",
            });
          req.user = {
            objectId: user._id,
            email: user.email,
            nickname: user.nickname,
            like_post: user.like_post,
            dislike_post: user.dislike_post,
            scrap_post: user.scrap_post,
            bookmark: user.bookmark,
            profileImage: user.profileImage,
            postLock: user.postLock,
          };
          next();
        });
      }
    );
  } catch (err) {
    console.log("에러", err);
    return res
      .status(500)
      .json({ success: false, isAuth: false, msg: `에러 ${err}` });
  }
};
export default authMiddleware;
