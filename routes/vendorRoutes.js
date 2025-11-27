const express = require("express");
const { getMySubmissions, updateProfile, updateKitchenPhotos } = require("../controllers/vendorController");
const { verifyToken, verifyVendor } = require("../middleware/authMiddleware");
const { kitchenPhotosUpload } = require("../utils/upload");

const router = express.Router();

router.use(verifyToken);
router.use(verifyVendor);

router.get("/submissions", getMySubmissions);
router.put("/profile", updateProfile);
router.put(
  "/kitchen/photos",
  (req, res, next) => {
    kitchenPhotosUpload(req, res, function (err) {
      if (err) {
        return res.status(400).json({
          message: err.message || "Upload error"
        });
      }
      next();
    });
  },
  updateKitchenPhotos
);

module.exports = router;