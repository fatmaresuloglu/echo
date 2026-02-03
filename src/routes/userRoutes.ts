import { Router } from 'express';
import { register } from '../controllers/userController.js';

const router = Router();

// /api/users/register adresine gider
router.post('/register', register);

export default router;