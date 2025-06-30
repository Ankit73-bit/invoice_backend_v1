import User from "../models/userModel.js";

export const createUser = async (req, res, next) => {
  try {
    const { fullName, email, password, company } = req.body;

    const newUser = await User.create({
      fullName,
      email,
      password,
      company,
    });

    // re-fetch with populated company
    const user = await User.findById(newUser._id).populate("company");

    res.status(201).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to create user!" });
  }
};

export const createUserByAdmin = async (req, res) => {
  const { fullName, email, password, company, role } = req.body;

  const user = await User.create({
    fullName,
    email,
    password,
    company,
    role: role || "user",
  });

  res.status(201).json({
    status: "success",
    data: { user },
  });
};

export const getAllUsers = async (req, res) => {
  const users = await User.find().populate("company", "name");
  res.status(200).json({
    status: "success",
    results: users.length,
    data: { users },
  });
};

export const getUserById = async (req, res) => {
  const users = await User.findOne(req.params.id).populate("company", "name");
  res.status(200).json({
    status: "success",
    data: { users },
  });
};

export const updateUser = async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.status(200).json({ status: "success", data: { user } });
};

export const deleteUser = async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.status(204).json({ status: "success", data: null });
};
