import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/user.model.js";
import { sendEmail } from "../utils/sendEmail.js";

const CODE_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

const generateToken = (user) =>
  jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

// Creates a 6-digit code, stores its bcrypt hash on the user, emails the plain code
const issueVerificationCode = async (user) => {
  const code = crypto.randomInt(100000, 1000000).toString();

  user.verificationCode = await bcrypt.hash(code, 10);
  user.verificationExpires = new Date(Date.now() + CODE_EXPIRY_MS);
  await user.save();

  await sendEmail({
    to: user.email,
    subject: "Verify your email",
    html: `
      <div style="font-family:sans-serif">
        <h2>Hi ${user.name},</h2>
        <p>Your verification code is:</p>
        <h1 style="letter-spacing:6px">${code}</h1>
        <p>This code expires in 10 minutes.</p>
      </div>`,
  });
};

// POST /api/users/register
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Name, email and password are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ success: false, message: "Password must be at least 6 characters" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      isVerified: false,
    });

    await issueVerificationCode(user);

    return res.status(201).json({
      success: true,
      message: "Registered. Check your email for the verification code.",
      email: user.email,
    });
  } catch (error) {
    console.error("Register error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// POST /api/users/verify-email
export const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res
        .status(400)
        .json({ success: false, message: "Email and code are required" });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select("+verificationCode +verificationExpires");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.isVerified) {
      return res
        .status(400)
        .json({ success: false, message: "Email already verified" });
    }

    if (!user.verificationCode || user.verificationExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "Code expired. Please request a new one.",
      });
    }

    const isMatch = await bcrypt.compare(String(code), user.verificationCode);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid code" });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationExpires = undefined;
    await user.save();

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Verify email error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// POST /api/users/resend-code
export const resendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Same response whether or not the user exists, to avoid leaking emails
    if (!user || user.isVerified) {
      return res.status(200).json({
        success: true,
        message: "If the account exists, a new code has been sent.",
      });
    }

    await issueVerificationCode(user);

    return res.status(200).json({
      success: true,
      message: "If the account exists, a new code has been sent.",
    });
  } catch (error) {
    console.error("Resend code error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// POST /api/users/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email first",
        needsVerification: true,
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
