const express = require("express");
const router = express.Router();
const {
  createUser,
  loginUser,
  forgotPassword,
  getUserList,
  deleteUser,
  getUserProfile,
  updateUserProfile,
  uploadProfileImage,
  loginWithGoogle,
  loginWithFacebook,
} = require("../controller/user.controller");
// const uploadFiles = require("../middleware/uploadFiles");
// const readImage = require('../middleware/readImage')
const { uploadFiles, readImage } = require("../middleware/uploadFiles");

router.post("/signup", createUser); // Sign up route
router.post("/login", loginUser); // Login route
router.post("/login-with-google", loginWithGoogle);
// router.post("/login-with-apple", loginWithApple);
router.post("/login-with-facebook", loginWithFacebook);


router.post("/forgot-password", forgotPassword); // Login route
// router.get("/get_user_list", getUserList); // Get users route
// router.delete("/delete_user/:uid", deleteUser); // Get users route
router.get("/get_user_profile/:email", getUserProfile);
router.put("/update-user-profile", updateUserProfile);

router.post(
  "/upload_profile_image/:email", // Include user email in the URL
  uploadFiles.single("profileImage"),
  uploadProfileImage
);
module.exports = router;
