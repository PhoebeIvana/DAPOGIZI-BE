// routes/mealPlanRoutes.js
const express = require("express");
const { auth } = require("../middleware/authMiddleware");
const { createMealPlan, updateMealPlan } = require("../controllers/mealPlanController");
const { mealImageUpload } = require("../utils/upload");

const router = express.Router();

// (Optional) create new meal plan (with optional image)
router.post("/meal-plans", auth("vendor"), (req, res, next) => {
  mealImageUpload(req, res, function (err) {
    if (err) return res.status(400).json({ message: err.message || "Upload error" });
    next();
  });
}, createMealPlan);

// Update existing meal plan info + nutrition + image
router.put("/meal-plans/:id", auth("vendor"), (req, res, next) => {
  mealImageUpload(req, res, function (err) {
    if (err) return res.status(400).json({ message: err.message || "Upload error" });
    next();
  });
}, updateMealPlan);

module.exports = router;
