// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const { User } = require("../models/userSchema");

const auth = (requiredRole = null) => {
  return async (req, res, next) => {
    try {
      const header = req.headers.authorization || "";
      const token = header.startsWith("Bearer ") ? header.split(" ")[1] : null;
      if (!token) return res.status(401).json({ message: "No token" });

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      if (!user) return res.status(401).json({ message: "Unauthorized" });

      if (requiredRole && user.role !== requiredRole) {
        return res.status(403).json({ message: "Forbidden" });
      }

      req.user = { _id: user._id, role: user.role };
      next();
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  };
};

module.exports = { auth };
