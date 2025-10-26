const { Vendor } = require("../models/vendorSchema");
const { User } = require("../models/userSchema");

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
    const vendor = await Vendor.findById(req.params.id).populate(
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
