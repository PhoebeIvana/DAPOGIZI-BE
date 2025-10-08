// routes/vendorRoutes.js
const express = require("express");
const { auth } = require("../middleware/authMiddleware");
const { updateProfile, updateKitchenPhotos } = require("../controllers/vendorController");
const { kitchenPhotosUpload } = require("../utils/upload");

const router = express.Router();

// Update vendor data: days, address, location (lat/lon), target schools (via Geoapify)
router.put("/profile", auth("vendor"), updateProfile);

// Update kitchen photos (form-data: photos[]), ?replace=true to overwrite
router.put("/kitchen/photos", auth("vendor"), (req, res, next) => {
  kitchenPhotosUpload(req, res, function (err) {
    if (err) return res.status(400).json({ message: err.message || "Upload error" });
    next();
  });
}, updateKitchenPhotos);

module.exports = router;
