import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import "dotenv/config";

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.EXPIRES_IN,
  });
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email })
      .select("+password")
      .populate("company");

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials!" });
    }

    const isMatch = await user.correctPassword(password);

    if (!isMatch) {
      res.status(401).json({ error: "Invalid Credentials!" });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      status: "sucess",
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        company: user.company,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Login failed!" });
    console.log(error);
  }
};
