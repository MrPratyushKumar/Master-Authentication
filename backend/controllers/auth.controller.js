import { User } from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { generateVerificationToken } from "../utils/generateVerificationCode.js";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { sendVerificationEmail, sendWelcomeEmail,  sendPasswordResetEmail } from "../mailtrap/emails.js"; // ← single import, both functions
import crypto from "crypto";

// ─── SIGNUP ───────────────────────────────────────────────────────────────────
export const signup = async (req, res) => {
  const { email, password, name } = req.body;
  try {
    if (!email || !password || !name) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: "Invalid email format" });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
    }

    const userAlreadyExists = await User.findOne({ email });
    if (userAlreadyExists) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    const verificationToken = generateVerificationToken();

    const user = new User({
      email,
      password: hashedPassword,
      name,
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });
    await user.save();

    generateTokenAndSetCookie(res, user._id);
    await sendVerificationEmail(user.email, verificationToken);

    res.status(201).json({
      success: true,
      message: "User created successfully. Please verify your email.",
      user: {
        ...user._doc,
        password: undefined,
        verificationToken: undefined,
        verificationTokenExpiresAt: undefined,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── VERIFY EMAIL ─────────────────────────────────────────────────────────────
export const verifyEmail = async (req, res) => {
  const { code } = req.body;
  try {
    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code",
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();

    await sendWelcomeEmail(user.email, user.name);

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      user: {
        ...user._doc,
        password: undefined,
        verificationToken: undefined,
        verificationTokenExpiresAt: undefined,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
export const login = async (req , res) => {
  const {email , password} = req.body;

  try {
    // 1 . validate fields
    if(!email || !password){
      return res.status(400).json({
        success : false,
        message : "All fields are required",
      });
    }

    // 2. find user 
    const user = await User.findOne({email});
    if(!user){
      return res.status(400).json({
        success : false,
        message : "Invalid credentials",  // never say "email not found" — security
      })
    }

    // 3. Check password 
    const isPasswordValid = await bcryptjs.compare(password , user.password);
    if(!isPasswordValid){
      return res.status(400).json({
        success : false,
        message : "Invalid credentials",
      })
    }

    // 4. Block unverified users;
    if(!user.isVerified){
      return res.status(403).json({
        success : false,
        message : "Please verified your email before login",
      });
    } 

    // 5. set JWt Token 
    generateTokenAndSetCookie(res , user._id);

    // 6. update last login 
    user.lastLogin = Date.now();

    await user.save();

    // 7. respond
    res.status(200).json({
      success : true,
      message : "Logged in successFully",
      user : {
        ...user._doc,
        password : undefined,
        verificationToken : undefined,
        verificationTokenExpiresAt : undefined
      },
    })
  } catch (error) {
    res.status(500).json({
      success : false,
      message : error.message
    })
  }
}

// ─── LOGOUT ───────────────────────────────────────────────────────────────────
export const logout = async (req, res) => {
  try {
    // just clear the the JWT cookie - no DB operation needed 
    res.clearCookie("token");
    res.status(200).json({
      success : true,
      message : "Logged out successfully"
    })
  } catch (error) {
    res.status(500).json({
      success : false,
      message : error.message
    });
  }
};

// ─── FORGOT PASSWORD ──────────────────────────────────────────────────────────

export const forgotPassword = async (req , res) => {
  const {email} = req.body
}