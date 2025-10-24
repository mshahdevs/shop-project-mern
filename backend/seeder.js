const Order = require("./models/orderModel");
const Product = require("./models/productModel");
const User = require("./models/userModel");
const users = require("./data/users");
const products = require("./data/products");
const dotenv = require("dotenv");
const path = require("path");
const cloudinary = require("./config/cloudinary");
dotenv.config();
const connectDB = require("./config/db");
connectDB();

const uploadImageToCloudinary = async (imagePath) => {
  try {
    // Construct full path to image
    const fullPath = path.join(__dirname, "public", imagePath);

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(fullPath, {
      folder: "shop-mern",
    });

    return result.secure_url;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    return imagePath; // Fallback to original path if upload fails
  }
};

const importData = async () => {
  try {
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    const createdUsers = await User.insertMany(users);
    const adminUser = createdUsers[0]._id;

    // Upload images and update products with Cloudinary URLs
    const productsWithCloudinaryUrls = await Promise.all(
      products.map(async (product) => {
        const cloudinaryUrl = await uploadImageToCloudinary(product.image);
        return {
          ...product,
          user: adminUser,
          image: cloudinaryUrl,
        };
      })
    );

    await Product.insertMany(productsWithCloudinaryUrls);
    console.log("Imported Data with Cloudinary Images");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    console.log("Destroyed Data");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

if (process.argv[2] === "-d") {
  destroyData();
} else {
  importData();
}
