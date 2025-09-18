const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const products = require("./data/products");
const connectDB = require("./config/db");
connectDB();
const app = express();
const productRoutes = require("./routes/productRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

app.get("/", (req, res) => {
  res.send("Api is ruinnnig...");
});
app.use("/api/products", productRoutes);
app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 5000;
app.listen(
  port,
  console.log(`Server running in ${process.env.NODE_ENV} on port 5000`)
);
