const express = require("express");
const router = express.Router();
const {
  authUser,
  getUserProfile,
  userRegister,
} = require("../controller/userController");
const { protect } = require("../middleware/authMiddleware");
router.post("/", userRegister);
router.post("/login", authUser);
router.route("/profile").get(protect, getUserProfile).put(protect);
module.exports = router;
