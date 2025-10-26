const express = require("express");
const { getVendorDetails, getAllVendors } = require("../controllers/adminController");

const router = express.Router();

router.get("/view-vendors", getAllVendors);
router.get("/view-vendor/:id", getVendorDetails);

module.exports = router;
