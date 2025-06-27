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

    if (!user.isActive) {
      return res
        .status(403)
        .json({ error: "Your account has been deactivated." });
    }

    if (!user.company || user.company.isActive === false) {
      return res
        .status(403)
        .json({ error: "Your company has been deactivated." });
    }

    const isMatch = await user.correctPassword(password);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials!" });
    }

    const token = generateToken(user._id);

    res
      .cookie("jwt", token, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .status(200)
      .json({
        status: "success",
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
    console.error(error);
  }
};

export const logoutUser = (req, res) => {
  res.clearCookie("jwt", {
    httpOnly: true,
    sameSite: "None",
    secure: true,
  });

  res.status(200).json({ status: "success", message: "Logged out" });
};
