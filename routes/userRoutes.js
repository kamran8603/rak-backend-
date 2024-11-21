const express = require("express");
const {
  register,
  login,
  updateProfilePicture,
  updatePassword,
  getUserProfile,
  getAllUsers,
  uploadUserDocument
} = require("../controllers/userController");
const router = express.Router();
const upload = require("../middleware/upload");
const { protect } = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);

router.get('/profile', protect(), getUserProfile);

// Route to update profile picture
router.post(
  "/updateProfilePicture",
  protect(),
  upload.single("profilePicture"),
  updateProfilePicture
);

// Route to update password
router.post("/updatePassword", protect(), updatePassword);

router.get('/profiles',  protect(["owner","user"]), getAllUsers);


router.post("/:userId/upload-document", upload.single("document"), uploadUserDocument);

module.exports = router;
