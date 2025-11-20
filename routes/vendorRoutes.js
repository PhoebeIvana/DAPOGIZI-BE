const express = require("express");
const { getMySubmissions } = require("../controllers/vendorController");
const { verifyToken, verifyVendor } = require("../middleware/authMiddleware");

const router = express.Router();

// Apply JWT authentication and vendor role verification to all routes
router.use(verifyToken);
router.use(verifyVendor);

router.get("/submissions", getMySubmissions);

module.exports = router;
