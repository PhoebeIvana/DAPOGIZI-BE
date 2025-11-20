const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = express();

// Importing routes
const authRoutes = require("./routes/authRoutes"); 
const adminRoutes = require("./routes/adminRoutes");
const vendorRoutes = require("./routes/vendorRoutes");

// Middleware
app.use(express.json());

// Load .env
dotenv.config();

// Set up routes
app.use("/user/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/vendor", vendorRoutes);

// Connection to MongoDB
mongoose
  .connect(process.env.MONGODB_URI,{
    dbName: "dapogizi_new",
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
