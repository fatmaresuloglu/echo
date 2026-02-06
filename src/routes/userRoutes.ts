import { Router } from 'express';
import { register, login, getProfile, updateProfile } from '../controllers/userController.js'; // 1. Buraya login'i ekle
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

// /api/users/register adresine gider
router.post('/register', register);

// 2. BU SATIRI EKLE: /api/users/login adresine gider
router.post('/login', login); 

router.get('/profile', authMiddleware, getProfile);


router.put('/update', authMiddleware, updateProfile);

export default router;