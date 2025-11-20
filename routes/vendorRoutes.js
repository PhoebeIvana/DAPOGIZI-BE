const express = require("express");
const { getMySubmissions } = require("../controllers/vendorController");
const { verifyToken, verifyVendor } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(verifyToken);
router.use(verifyVendor);

router.get("/submissions", getMySubmissions);

module.exports = router;
