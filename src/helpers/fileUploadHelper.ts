import multer from "multer";

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: 3000 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/avif",
      "video/mp4",
      "video/x-matroska",
      "application/pdf",
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error("File type not allowed") as unknown as null, false);
    }
    cb(null, true);
  },
});

// upload single image
const videoUrl = upload.single("videoUrl");
const profileImage = upload.single("profileImage");
const cvUrl = upload.single("cvUrl");
const serviceImage = upload.single("serviceImage");

// upload multiple image
const uploadMultiple = upload.fields([
  { name: "profileImage", maxCount: 1 },
  { name: "url2", maxCount: 1 },
  { name: "fileUrl", maxCount: 1 },
  { name: "logo", maxCount: 1 },
  { name: "vatUrl", maxCount: 1 },
  { name: "nidUrl", maxCount: 1 },
  { name: "optionalPhoto", maxCount: 1 },
  { name: "additionalPhoto", maxCount: 1 },
  { name: "mediaUrls", maxCount: 5 },
  { name: "serviceImage", maxCount: 5 },
  { name: "url1", maxCount: 1 },
  { name: "url3", maxCount: 1 },
  { name: "url4", maxCount: 1 },
  { name: "url5", maxCount: 1 }
]);

export const fileUploader = {
  upload,
  videoUrl,
  uploadMultiple,
  profileImage,
  cvUrl,
  serviceImage
};
