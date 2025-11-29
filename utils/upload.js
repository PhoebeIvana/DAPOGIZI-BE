const multer = require("multer");

const storage = multer.memoryStorage();

function imageFileFilter(req, file, cb) {
  const ok = /image\/(jpeg|jpg|png|webp)/.test(file.mimetype);
  cb(ok ? null : new Error("Only .jpg are allowed"), ok);
}

const kitchenPhotosUpload = multer({
  storage: storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 3 * 1024 * 1024, files: 5 }, // 3MB each, up to 5
}).array("photos", 5);

const mealImageUpload = multer({
  storage: storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 3 * 1024 * 1024, files: 1 }, // 3MB
}).single("image");

module.exports = { kitchenPhotosUpload, mealImageUpload };
