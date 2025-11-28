// utils/upload.js
const path = require("path");
const fs = require("fs");
const multer = require("multer");

function makeStorage(subdir) {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const dest = path.join(process.cwd(), "uploads", subdir);
      fs.mkdirSync(dest, { recursive: true });
      cb(null, dest);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname || "");
      const base = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, base + ext);
    },
  });
}

function imageFileFilter(req, file, cb) {
  const ok = /image\/(jpg)/.test(file.mimetype);
  cb(ok ? null : new Error("Only .jpg are allowed"), ok);
}

const kitchenPhotosUpload = multer({
  storage: makeStorage("kitchens"),
  fileFilter: imageFileFilter,
  limits: { fileSize: 3 * 1024 * 1024, files: 5 }, // 3MB each, up to 5
}).array("photos", 5);

const mealImageUpload = multer({
  storage: makeStorage("meals"),
  fileFilter: imageFileFilter,
  limits: { fileSize: 3 * 1024 * 1024, files: 1 }, // 3MB
}).single("image");

module.exports = { kitchenPhotosUpload, mealImageUpload };
