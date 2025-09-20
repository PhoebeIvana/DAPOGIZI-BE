const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models/userSchema");
const { Vendor } = require("../models/vendorSchema");
const dotenv = require("dotenv");

dotenv.config();

const signup = async (req, res) => {
  try {
    const { email, password, vendor_name } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already exists" });

    if (!vendor_name) {
      return res.status(400).json({ message: "Vendor name is required" });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      password_hash,
      role: "vendor",
    });
    await newUser.save();

    const newVendor = new Vendor({
      user_id: newUser._id,
      vendor_name,
    });
    await newVendor.save();

    res.status(201).json({
      message: "Signup success",
      userId: newUser._id,
      role: "vendor",
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login success",
      token,
      role: user.role,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getVendorMe = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "No token" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId);
    if (!user || user.role !== "vendor") {
      return res.status(403).json({ message: "Not a vendor" });
    }

    const vendor = await Vendor.findOne({ user_id: user._id });
    res.json({ vendor });
  } catch (error) {
    console.error("Get vendor error:", error);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = { signup, login, getVendorMe };
