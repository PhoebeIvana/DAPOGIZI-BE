const { Vendor } = require("../models/vendorSchema");
const { User } = require("../models/userSchema");
const { KitchenCheck } = require("../models/kitchenCheckSchema");

exports.getAllVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find().populate("user_id", "email");

    const data = vendors.map((vendor) => ({
      id: vendor._id,
      vendor_name: vendor.vendor_name,
      address: vendor.address || "N/A",
      email: vendor.user_id?.email || "N/A",
    }));

    res.json({ success: true, data });
  } catch (err) {
    console.error("Get all vendors error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getVendorDetails = async (req, res) => {
  try {
    const vendorId = req.params.id;
    const vendor = await Vendor.findById(vendorId).populate(
      "user_id",
      "email"
    );
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    const data = {
      vendor_name: vendor.vendor_name,
      address: vendor.address || "N/A",
      email: vendor.user_id?.email || "N/A",
    };

    res.json({ success: true, data });
  } catch (err) {
    console.error("Get vendor details error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getKitchenChecksForVendor = async (req, res) => {
  try {
    const vendorId = req.params.vendorId;
    const checks = await KitchenCheck.find({ vendor_id: vendorId }).populate(
      "checked_by",
      "email"
    );

    const data = checks.map((c) => ({
      id: c._id,
      check_date: c.check_date,
      score: c.score,
      status: c.status,
      notes: c.notes || "",
      checked_by: c.checked_by?.email || null,
    }));

    res.json({ success: true, data });
  } catch (err) {
    console.error("Get kitchen checks error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateKitchenCheck = async (req, res) => {
  try {
    const checkId = req.params.checkId;
    const { score, status, notes } = req.body;

    const check = await KitchenCheck.findById(checkId);
    if (!check) return res.status(404).json({ message: "Check not found" });

    if (score !== undefined) check.score = score;
    if (status !== undefined) check.status = status;
    if (notes !== undefined) check.notes = notes;

    await check.save();

    res.json({ success: true, data: check });
  } catch (err) {
    console.error("Update kitchen check error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
