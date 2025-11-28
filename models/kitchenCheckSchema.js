const mongoose = require("mongoose");

const kitchenCheckSchema = new mongoose.Schema({
  vendor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendors",
    required: true,
  },
  check_date: {
    type: Date,
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["clean", "dirty"],
    required: true,
  },
  notes: {
    type: String,
  },
  checked_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    default: null,  
  },
});

const KitchenCheck = mongoose.model("KitchenCheck", kitchenCheckSchema, "kitchen_cleanliness_checks");
module.exports = { KitchenCheck };
