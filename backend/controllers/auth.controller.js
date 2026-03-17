import { User } from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import {generateVerificationToken } from "../utils/generateVerificationCode.js";
export const signup = async (req, res) => {
  const { email, password, name } = req.body;
  try {
    if (!email || !password || !name) {
      throw new Error("All fields are required");
    }
    // check user already exist or not
    const userAlreadyExists = await User.findOne({ email });
    if (userAlreadyExists) {
      // it means user Aleready exist there
      return res.status(400).json({
        success: false,
        message: "User Already exists",
      });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    const verificationToken = generateVerificationToken();
    // create a new user
    const user = new User({
      email,
      password: hashedPassword,
      name,
      verificationToken,
      verificationTokenExpiresAt : Date.now() + 24 * 60 * 60 * 1000 // 24 hours 
    });
    // Now save user to the Database 
    await user.save(); // this will save User To the Database
    // jwt
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const login = async (req, res) => {
  res.send("login route");
};

export const logout = async (req, res) => {
  res.send("logout route");
};
