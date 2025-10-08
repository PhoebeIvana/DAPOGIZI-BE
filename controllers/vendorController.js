// controllers/vendorController.js
const { Vendor } = require("../models/vendorSchema");
const { geocodeAddress, resolveTargetSchools } = require("../utils/geoapify");

const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const vendor = await Vendor.findOne({ user_id: userId });
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    const {
      vendor_name,
      address,
      operating_days,        // array of strings ["Mon", ...]
      location,              // optional: { lat, lon }
      target_schools,        // optional: array of school names
    } = req.body || {};

    if (vendor_name != null) vendor.vendor_name = vendor_name;
    if (address != null) vendor.address = address;
    if (Array.isArray(operating_days)) vendor.operating_days = operating_days;

    // Determine coordinates: prefer client-provided location, else geocode address
    let baseLonLat = null;
    if (location && location.lat != null && location.lon != null) {
      vendor.location = {
        type: "Point",
        coordinates: [Number(location.lon), Number(location.lat)],
      };
      baseLonLat = { lon: Number(location.lon), lat: Number(location.lat) };
    } else if (address) {
      const geo = await geocodeAddress(address);
      if (geo) {
        vendor.location = {
          type: "Point",
          coordinates: [geo.lon, geo.lat],
        };
        baseLonLat = { lon: geo.lon, lat: geo.lat };
      }
    } else if (vendor.location?.coordinates?.length === 2) {
      baseLonLat = {
        lon: vendor.location.coordinates[0],
        lat: vendor.location.coordinates[1],
      };
    }

    // Resolve schools via Geoapify if provided
    if (Array.isArray(target_schools)) {
      const resolved = await resolveTargetSchools(target_schools, baseLonLat);
      vendor.target_schools = resolved;
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

    // multer put files at req.files
    const files = req.files || [];
    const urls = files.map((f) => {
      const basename = f.filename;
      return `/uploads/kitchens/${basename}`;
    });

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
