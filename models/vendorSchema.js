// models/vendorSchema.js
const mongoose = require("mongoose");

const targetSchoolSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [lon, lat]
        default: [0, 0],
      },
    },
    geoapify_id: { type: String },
  },
  { _id: false }
);

const vendorSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    vendor_name: {
      type: String,
      required: true,
    },
    address: {
      type: String,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [lon, lat]
        default: [0, 0],
      },
    },
    operating_days: {
      type: [String], // e.g. ["Mon", "Tue", "Wed"]
      default: [],
    },
    kitchen_photos: {
      type: [String], // URLs to /uploads/kitchens/...
      default: [],
    },
    target_schools: {
      type: [targetSchoolSchema],
      default: [],
    },
  },
  { timestamps: true }
);

vendorSchema.index({ location: "2dsphere" });

const Vendor = mongoose.model("Vendors", vendorSchema);
module.exports = { Vendor };
