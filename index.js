// index.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const app = express();

// Load .env
dotenv.config();

// Middleware
app.use(express.json());

// Static for uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
const authRoutes = require("./routes/authRoutes");
const vendorRoutes = require("./routes/vendorRoutes");
const mealPlanRoutes = require("./routes/mealPlanRoutes");

app.use("/auth", authRoutes);
app.use("/vendor", vendorRoutes);       // /vendor/profile, /vendor/kitchen/photos
app.use("/vendor", mealPlanRoutes);     // /vendor/meal-plans...

// Connection to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Successfully connected to MongoDB");
    app.listen(process.env.PORT, () => {
      console.log("Server is successfully running on " + process.env.PORT);
    });
  })
  .catch((error) => {
    console.log(error);
  });

// Event listener to monitor the connection
const con = mongoose.connection;
con.on("disconnected", () => {
  console.log("[ALERT] MongoDB disconnected");
});
