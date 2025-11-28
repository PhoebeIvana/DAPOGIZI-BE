const { Vendor } = require("../models/vendorSchema");
const { MealPlan } = require("../models/mealPlanSchema");
const { KitchenCheck } = require("../models/kitchenCheckSchema");
const { geocodeAddress, findNearbySchools } = require("../utils/geoapify");
const { analyzeKitchenImage } = require("../services/kitchenAIService");
const { determineKitchenStatus } = require("../utils/kitchenStatus");
const { uploadToSupabase, downloadFromSupabase } = require("../utils/supabaseUpload");

const getMySubmissions = async (req, res) => {
  try {
    const vendorRecord = await Vendor.findOne({ user_id: req.userId });
    if (!vendorRecord) {
      return res.status(404).json({ 
        success: false, 
        message: "Vendor profile not found" 
      });
    }

    const queryFilter = { vendor_id: vendorRecord._id };

    const { createdAt } = req.query;
    
    if (createdAt) {
      const parsedDate = new Date(createdAt);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid createdAt format. Use YYYY-MM-DD" 
        });
      }
      
      parsedDate.setHours(0, 0, 0, 0);
      queryFilter.createdAt = { $gte: parsedDate };
    }

    const mealPlanSubmissions = await MealPlan.find(queryFilter)
      .populate("approved_by", "email")
      .sort({ createdAt: -1 });

    const formattedSubmissions = mealPlanSubmissions.map((submission) => ({
      id: submission._id,
      name: submission.name,
      image_url: submission.image_url || null,
      status: submission.status,
      approved_by: submission.approved_by?.email || null,
      approved_at: submission.approved_at || null,
      created_at: submission.createdAt,
      updated_at: submission.updatedAt,
    }));

    res.json({
      success: true,
      total_count: mealPlanSubmissions.length,
      data: formattedSubmissions,
      filter_applied: {
        created_at: createdAt || null,
      },
    });
  } catch (error) {
    console.error("Get vendor submissions error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error while fetching submissions" 
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const vendor = await Vendor.findOne({ user_id: userId });
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    const {
      vendor_name,
      address,
      operating_days,  
      location,        
      skip_geo         
    } = req.body || {};

    if (vendor_name != null) vendor.vendor_name = vendor_name;
    if (address != null) vendor.address = address;
    if (Array.isArray(operating_days)) vendor.operating_days = operating_days;

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

    if (bias) {
      const schools = await findNearbySchools(bias, 3);
      vendor.target_schools = schools; 
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
    if (files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const filenames = files.map(f => f.originalname.toLowerCase());
    const hasDuplicate = filenames.some((name, idx) => filenames.indexOf(name) !== idx);

    if (hasDuplicate) {
      return res.status(400).json({
        message: "Duplicate filenames detected. Please rename your files before uploading."
      });
    }
    const uploadPromises = files.map((file) =>
      uploadToSupabase(file.buffer, "kitchens", file.originalname)
    );
    const supabaseUrls = await Promise.all(uploadPromises);

    const replace = (req.query.replace || "").toLowerCase() === "true";
    vendor.kitchen_photos = replace ? supabaseUrls : [...(vendor.kitchen_photos || []), ...supabaseUrls];

    await vendor.save();

    let aiResult = null;

    if (supabaseUrls.length > 0) {
      const lastFileUrl = supabaseUrls[supabaseUrls.length - 1];
      const lastFile = files[files.length - 1];

      try {
        const imageBuffer = await downloadFromSupabase(lastFileUrl);

        const aiData = await analyzeKitchenImage(imageBuffer, lastFile.originalname);
        const status = determineKitchenStatus(aiData.prediction);

        const kitchenCheck = await KitchenCheck.create({
          vendor_id: vendor._id,
          score: aiData.confidence,
          status: status,
          notes: req.body.notes || "",
          checked_by: req.user._id,
          check_date: new Date(),
        });

        aiResult = {
          score: kitchenCheck.score,
          status: kitchenCheck.status,
        };
      } catch (e) {
        console.error("Analysis AI error:", e.message);
      }
    }

    return res.json({
      message: "Kitchen photos updated",
      kitchen_photos: vendor.kitchen_photos,
      kitchen_check: aiResult,
    });
  } catch (e) {
    console.error("updateKitchenPhotos failed:", e);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getMySubmissions, updateProfile, updateKitchenPhotos };
