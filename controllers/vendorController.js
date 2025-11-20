const { Vendor } = require("../models/vendorSchema");
const { MealPlan } = require("../models/mealPlanSchema");

exports.getMySubmissions = async (req, res) => {
  try {
    // User is already authenticated and verified as vendor by middleware
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
      
      // Filter for submissions created on or after this date
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

