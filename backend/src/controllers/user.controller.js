import userModel from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

async function register(req, res) {

  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(401).json({
      message: "username, email and password are required."
    });
  }

  const isUserExists = await userModel.findOne({ email });

  if (isUserExists) {
    return res.status(409).json({
      message: "Email already exist."
    });
  }

  const hash = await bcrypt.hash(password, 10);

  const user = await userModel.create({
    username,
    email,
    password: hash
  });

  const token = jwt.sign({
    userId: user._id,
    email: user.email
  },
    // jwt secret

    {
      expireIn: "30d"
    }
  );

}
