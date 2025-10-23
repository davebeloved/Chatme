import jwt from "jsonwebtoken";
import { ENV } from "./env.js";

export const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, ENV.JWT_SECRET, {
    expiresIn: "7d",
  });
  res.cookie("token", token, {
    httpOnly: true,
    secure: ENV.NODE_ENV === "development" ? false : true,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
  return token;
};
