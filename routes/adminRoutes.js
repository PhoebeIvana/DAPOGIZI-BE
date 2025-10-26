const express = require("express");
const {
	getVendorDetails,
	getAllVendors,
	getKitchenChecksForVendor,
	updateKitchenCheck,
} = require("../controllers/adminController");

const router = express.Router();

router.get("/view-vendors", getAllVendors);
router.get("/view-vendor/:id", getVendorDetails);
router.get("/kitchen-checks/vendor/:vendorId", getKitchenChecksForVendor);
router.put("/kitchen-check/:checkId", updateKitchenCheck);

module.exports = router;
