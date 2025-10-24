const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname, ".env") });
console.log("Environment variables loaded from:", path.join(__dirname, ".env"));
const products = require("./data/products");
const connectDB = require("./config/db");
const app = express();

// Connect to MongoDB
connectDB()
  .then(() => {
    console.log("MongoDB connection established successfully");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const productRoutes = require("./routes/productRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

app.get("/", (req, res) => {
  res.send("Api is ruinnnig...");
});
app.use("/api/products", productRoutes);
app.use("/api/upload", uploadRoutes);
app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 5000;
app.listen(
  port,
  console.log(`Server running in ${process.env.NODE_ENV} on port 5000`)
);
