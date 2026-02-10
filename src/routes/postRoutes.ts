import { Router } from 'express';
// Noktalara dikkat: ../ ile bir üst klasöre çıkıyoruz
import { createPost, getAllPosts, deletePost, likePost } from '../controllers/postController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();
router.get('/', authMiddleware, getAllPosts);
router.post('/create', authMiddleware, createPost);
router.delete('/:id', authMiddleware, deletePost);
router.post('/:id/like', authMiddleware, likePost);
export default router;