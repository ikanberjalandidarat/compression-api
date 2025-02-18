import express from 'express';
import multer from 'multer';
import { imageCompression, videoCompression } from '../compression/model.js';

const router = express.Router();
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// Image compression endpoint
router.post('/compress/image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const compressedImage = await imageCompression(req.file.buffer);
    
    res.set('Content-Type', 'image/jpeg');
    res.send(compressedImage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Video compression endpoint
router.post('/compress/video', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    const compressedVideo = await videoCompression(req.file.buffer);
    
    res.set('Content-Type', 'video/mp4');
    res.send(compressedVideo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

