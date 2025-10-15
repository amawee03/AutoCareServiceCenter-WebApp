// middleware/multer.js
import multer from 'multer';
import path from 'path';

const UPLOADS_FOLDER = path.join(process.cwd(), 'uploads');

// Make sure folder exists (you can also create it manually)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_FOLDER);
  },
  filename: (req, file, cb) => {
    // keep original name with timestamp to avoid collisions
    cb(null, Date.now() + '-' + file.originalname);
  }
});

// optional: accept only common image types
const fileFilter = (req, file, cb) => {
  if (/^image\/(jpeg|jpg|png|webp|gif)$/.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit (adjust as needed)
  fileFilter,
});

export default upload;
