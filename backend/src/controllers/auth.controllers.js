import { sendWelcomeEmail } from "../emails/EmailHandlers.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { ENV } from "../lib/env.js";
export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  try {
    if (!fullName || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email already in use" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      generateToken(newUser._id, res);
      await newUser.save();
      res.status(201).json({
        success: true,
        message: "User created successfully",
        user: {
          _id: newUser._id,
          fullName: newUser.fullName,
          email: newUser.email,
        },
      });

      try {
        await sendWelcomeEmail(newUser.email, newUser.fullName, ENV.CLIENT_URL);
      } catch (error) {
        console.error("Error sending welcome email:", error);
      }
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Failed to create user" });
    }
  } catch (error) {
    console.error("Error during signup:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server Error. Please try again.",
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }
    generateToken(user._id, res);
    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server Error. Please try again.",
    });
  }
};
export const logout = async (_, res) => {
  try {
    res.cookie("token", "", { maxAge: 0 });
    return res
      .status(200)
      .json({ success: true, message: "Logout successful" });
  } catch (error) {
    console.error("Error during logout:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server Error. Please try again.",
    });
  }
};
