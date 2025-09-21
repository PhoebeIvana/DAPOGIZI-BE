const mongoose = require("mongoose");

const mealDetailSchema = new mongoose.Schema({
  meal_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MealPlan",
    required: true,
  },
  overall_calories: {
    type: Number,
    required: true,
  },
  protein: {
    type: Number,
    required: true,
  },
  fat: {
    type: Number,
    required: true,
  },
  carbs: {
    type: Number,
    required: true,
  },
  sugar: {
    type: Number,
    required: true,
  },
  fiber: {
    type: Number,
    required: true,
  },
});

const MealPlanDetail = mongoose.model("MealDetail", mealDetailSchema);
module.exports = { MealPlanDetail };
