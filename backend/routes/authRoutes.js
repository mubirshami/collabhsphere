import express from 'express';
import { register, login, getProfile, updateProfile } from '../controllers/authController.js';
import { adminOnly, protect } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import User from '../models/User.js';

const router = express.Router();

// Multer storage for avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), 'backend', 'uploads', 'avatars'));
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.png';
    cb(null, unique + ext);
  }
});
const upload = multer({ storage });

router.post('/register', register);
router.post('/login', login);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

// Upload avatar endpoint
router.post('/profile/avatar', protect, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const relativePath = `/uploads/avatars/${req.file.filename}`;
    // Save path on user
    const user = await (await import('../models/User.js')).default.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.avatar = relativePath;
    await user.save();
    return res.status(201).json({ avatar: relativePath });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Admin: list users
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Admin: update user role
router.put('/users/:id/role', protect, adminOnly, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['Admin', 'Member'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.role = role;
    await user.save();
    res.json({ _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

export default router;

