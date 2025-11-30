// routes/mealPlanRoutes.js
const express = require("express");
const { verifyToken, verifyVendor } = require("../middleware/authMiddleware");
const { createMealPlan, updateMealPlan } = require("../controllers/mealPlanController");
const { mealImageUpload } = require("../utils/supabaseUpload");

const router = express.Router();

router.use(verifyToken);
router.use(verifyVendor);

// (Optional) create new meal plan (with optional image)
router.post("/meal-plans", (req, res, next) => {
  mealImageUpload(req, res, function (err) {
    if (err) {
      return res.status(400).json({ message: err.message || "Upload error" });
    }
    next();  // Proceed to the createMealPlan function
  });
}, createMealPlan);

// Update existing meal plan info + nutrition + image
router.put("/meal-plans/:id", (req, res, next) => {
  mealImageUpload(req, res, function (err) {
    if (err) {
      return res.status(400).json({ message: err.message || "Upload error" });
    }
    next();  // Proceed to the updateMealPlan function
  });
}, updateMealPlan);

module.exports = router;