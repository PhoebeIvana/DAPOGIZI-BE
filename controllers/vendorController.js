// controllers/vendorController.js
const { Vendor } = require("../models/vendorSchema");
const { geocodeAddress, findNearbySchools } = require("../utils/geoapify");

const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const vendor = await Vendor.findOne({ user_id: userId });
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    const {
      vendor_name,
      address,
      operating_days,  // ["Mon", ...]
      location,        // optional { lat, lon } to override geocode
      skip_geo         // optional: "true" to NOT geocode address
    } = req.body || {};

    if (vendor_name != null) vendor.vendor_name = vendor_name;
    if (address != null) vendor.address = address;
    if (Array.isArray(operating_days)) vendor.operating_days = operating_days;

    // Determine coordinates to use as search bias for schools
    let bias = null;
    const wantSkipGeo = String(skip_geo || "").toLowerCase() === "true";

    if (location && location.lat != null && location.lon != null) {
      vendor.location = {
        type: "Point",
        coordinates: [Number(location.lon), Number(location.lat)],
      };
      bias = { lon: Number(location.lon), lat: Number(location.lat) };
    } else if (!wantSkipGeo && address) {
      const geo = await geocodeAddress(address);
      if (geo) {
        vendor.location = { type: "Point", coordinates: [geo.lon, geo.lat] };
        bias = { lon: geo.lon, lat: geo.lat };
      }
    } else if (vendor.location?.coordinates?.length === 2) {
      bias = {
        lon: vendor.location.coordinates[0],
        lat: vendor.location.coordinates[1],
      };
    }

    // === AUTO-ASSIGN NEAREST 3 SCHOOLS (no user input needed) ===
    // If we have a bias coordinate, fetch & assign 3 nearby schools.
    if (bias) {
      const schools = await findNearbySchools(bias, 3);
      vendor.target_schools = schools; // overwrite with exactly 3 (or fewer if API returns less)
    }

    await vendor.save();
    return res.json({ message: "Vendor updated", vendor });
  } catch (err) {
    console.error("updateProfile error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

const updateKitchenPhotos = async (req, res) => {
  try {
    const userId = req.user._id;
    const vendor = await Vendor.findOne({ user_id: userId });
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    const files = req.files || [];
    const urls = files.map((f) => `/uploads/kitchens/${f.filename}`);

    const replace = (req.query.replace || "").toLowerCase() === "true";
    vendor.kitchen_photos = replace ? urls : [...(vendor.kitchen_photos || []), ...urls];

    await vendor.save();
    return res.json({
      message: "Kitchen photos updated",
      kitchen_photos: vendor.kitchen_photos,
    });
  } catch (err) {
    console.error("updateKitchenPhotos error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = { updateProfile, updateKitchenPhotos };
