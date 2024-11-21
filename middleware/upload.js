const multer = require('multer');
const path = require('path');

// Configure storage for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // directory to save the uploaded files
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// File filter to accept images and documents (e.g., jpeg, png, pdf, docx)
const fileFilter = (req, file, cb) => {
  // Define allowed file extensions for images and documents
  const filetypes = /jpeg|jpg|png|pdf|doc|docx/;
  // Check the file mimetype and extension
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  
  if (mimetype && extname) {
    return cb(null, true); // Accept the file
  } else {
    cb('Error: Only images and documents are allowed!'); // Reject the file
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter, // Apply the custom file filter
  limits: { fileSize: 1024 * 1024 * 20 }, // 20MB file size limit
});

module.exports = upload;
