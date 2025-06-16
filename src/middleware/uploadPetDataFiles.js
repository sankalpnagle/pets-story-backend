const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const multer = require("multer");
const multerS3 = require("multer-s3");
const { v4: uuidv4 } = require("uuid");

// AWS S3 Configuration
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Multer S3 Storage for Image
const uploadFiles = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME,
    key: (req, file, cb) => {
      const folder = file.mimetype.startsWith("image/")
        ? "pet-images"
        : "pet-documents";
      cb(null, `${folder}/${uuidv4()}_${file.originalname}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype.startsWith("image/") ||
      file.mimetype === "application/pdf"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only images and PDFs are allowed."));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Middleware to handle file uploads
const uploadPetData = uploadFiles.fields([
  { name: "image", maxCount: 1 }, // Accept only one image
  { name: "pdf", maxCount: 1 }, // Accept only one PDF
]);
module.exports = { uploadPetData };
