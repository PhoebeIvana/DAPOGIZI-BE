// models/counterSchema.js
const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true }, // sequence name
    seq: { type: Number, default: 0 },
  },
  { collection: "counters" }
);

const Counter = mongoose.model("Counter", counterSchema);
module.exports = { Counter };
