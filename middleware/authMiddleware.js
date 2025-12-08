const jwt = require("jsonwebtoken");
const { User } = require("../models/userSchema");
const dotenv = require("dotenv");

dotenv.config();

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "No authorization token provided"
      });
    }

    const token = authHeader.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Invalid token format"
      });
    }

    try {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      
      const user = await User.findById(decodedToken.userId);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not found"
        });
      }

      req.user = user;
      req.userId = user._id;
      req.userRole = user.role;
      
      next();
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token"
      });
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during authentication"
    });
  }
};

const verifyAdmin = async (req, res, next) => {
  try {
    if (!req.user || req.userRole !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin role required"
      });
    }
    next();
  } catch (error) {
    console.error("Admin verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during authorization"
    });
  }
};

const verifyVendor = async (req, res, next) => {
  try {
    if (!req.user || req.userRole !== "vendor") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Vendor role required"
      });
    }
    next();
  } catch (error) {
    console.error("Vendor verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during authorization"
    });
  }
};

module.exports = {
  verifyToken,
  verifyAdmin,
  verifyVendor
};
