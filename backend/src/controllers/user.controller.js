import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import User from "../models/user.model.js";
import { sendVerificationEmail } from "../utils/email.js";
import { createCode, deleteCode, verifyCode } from "../utils/otp.js";

// generate a token
const generateToken = (user) =>
  jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });


// POST /api/users/register
export const register = async (req, res) => {
  try {
    // get the username, email and password from request
    const { username, email, password } = req.body;

    // if username, email, password are missing
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Username, email and password are required"
      });
    }

    // check the password length
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters"
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedUsername = username.trim();

    // find user by username and email
    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
    });

    // if user exists
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email or username already taken"
      });
    }

    // hash the user password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create a user model
    const user = await User.create({
      username: normalizedUsername,
      email: normalizedEmail,
      password: hashedPassword,
      isVerified: false,
    });

    // create the OTP and send it to user
    const code = createCode(normalizedEmail);
    await sendVerificationEmail(normalizedEmail, code);

    // new user created
    return res.status(201).json({
      success: true,
      message: "Registered, check you email for verification code.",
      email: user.email
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};


// POST /api/users/verify
export const verifyEmail = async (req, res) => {
  try {
    // get the email and verification code from request
    const email = (req.body.email || "").toLowerCase().trim();
    const { code } = req.body;

    // if email or code are missing
    if (!email || !code) {
      return res.status(409).json({
        success: false,
        message: "Email and Code are required."
      });
    }

    // find the user by email
    const user = await User.findOne({ email });

    // check if user not found
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    // check if the user verified
    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Already verified"
      });
    }

    // verify the given code
    const result = verifyCode(email, code);
    if (!result.ok) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    // if verify successful than save to database
    user.isVerified = true;
    await user.save();

    // generate a token
    const token = generateToken(user);

    // send the all data for the user
    return res.status(200).json({
      success: true,
      message: "Email verified.",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
}

// POST /api/users/resend-code
export const resendCode = async (req, res) => {
  try {
    // get the email from request 
    const email = (req.body.email || "").toLowerCase().trim();

    // find the user by email
    const user = await User.findOne({ email });

    // check if user exists and not verified
    if (user && !user.isVerified) {
      // create a OTP and send it to user
      await sendVerificationEmail(email, createCode(email));
    }

    // return the success in response
    return res.status(200).json({
      success: true,
      message: "If the account exists, a new code was sent"
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Could not send code"
    });
  }
};


// POST /api/users/login
export const login = async (req, res) => {
  try {
    // get the email and password
    const { email, password } = req.body;

    // if any one are missing
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    // check if the user is verified
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email first"
      });
    }

    // find the user by email
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // if the password or email is incorrect
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // match the given password to saved password
    const isMatch = await bcrypt.compare(password, user.password);

    // if password is wrong
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // generate a token
    const token = generateToken(user);

    // send the user data and token by response
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      },
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};



// POST /api/users/signOut
export const signOut = (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Signed out successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not sign out"
    });
  }
};


// GET /api/users/me 
export const me = (req, res) => {

  // send the user data
  res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      bio: req.user.bio,
      github: req.user.github
    },
  });
};


// OAuth secret
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// POST api/users/googleLogin
export const googleLogin = async (req, res) => {

  try {
    // get the ticket from the request
    const ticket = await client.verifyIdToken({
      idToken: req.body.credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, name, sub, email_verified } = ticket.getPayload();

    // if the email is not verified
    if (!email_verified) {
      return res.status(400).json({
        success: false,
        message: "Email not verified"
      });
    }

    // find the user by email
    let user = await User.findOne({ email });

    // if the user isn't exists than create an user
    if (!user) {
      user = await User.create({
        username: name,
        email,
        googleId: sub
      });
    }

    // generate a token
    const token = generateToken(user);

    // send the user data into the response
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      },
    });

  } catch (err) {

    res.status(401).json({
      message: "Invalid google token."
    });
  }
}

// GET api/users/updateProfile
export const updateUser = async (req, res) => {
  try {
    // get the username, bio, github link for updates
    const { username, bio, github } = req.body;
    const updates = {};

    // check username is not undefined and it in not string
    if (username !== undefined) {
      if (typeof username !== "string") {
        return res.status(400).json({
          success: false,
          message: "Invalid username."
        });
      }
      // if not undefined and it is a string
      updates.username = username;
    }

    // check bio is not undefined and it in not string
    if (bio !== undefined) {
      if (typeof bio !== "string") {
        return res.status(400).json({
          success: false,
          message: "Invalid bio."
        });
      }
      // if not undefined and it is a string
      updates.bio = bio;
    }

    // check github is not undefined and it in not string
    if (github !== undefined) {
      if (typeof github !== "string") {
        return res.status(400).json({
          success: false,
          message: "Invalid github link."
        });
      }
      // if not undefined and it is a string
      updates.github = github;
    }

    // check if the Object length is empty
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Nothing to change."
      });
    }

    // find an user and updates it's data
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    // if the user not exists
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // response the user data
    res.status(200).json({
      success: true,
      user: user
    });

  } catch (err) {
    // if the user already exists
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "User already taken."
      });
    }

    if (err.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error."
    });
  }
}

// GET /api/users/deleteUser
export const deleteUser = async (req, res) => {
  try {
    // get the username and password
    const { email, password } = req.body;

    // if anyone is missing
    if (!email || !password) {
      return res.status(400).json({
        status: false,
        message: "Email and password are required."
      });
    }

    // find the user by email
    const user = await User.findOne({ email });

    // if user not exists
    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found."
      });
    }

    // compare the given password to user password
    const isMatch = await bcrypt.compare(password, user.password);

    // it the password is wrong
    if (!isMatch) {
      return res.status(401).json({
        status: false,
        message: "Invalid password."
      });
    }

  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Server error."
    });
  }
}

// GET /api/user/searchUser
export const searchUser = async (req, res) => {

  try {
    // get the username from the url parameter
    const username = req.params.username.trim();

    // find the user and get username, email, bio and github link
    const user = await User.findOne({ username })
      .collation({ locale: "en", strength: 2 })
      .select("username email bio github");

    // if the user not exists
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    // send searched user data by response  
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        github: user.github
      }
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error."
    });
  }
}
