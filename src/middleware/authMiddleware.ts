import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authMiddleware = (req: any, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Giriş kartın yok, giremezsin!' });
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'gizli-anahtar');
    req.userId = decoded.userId; // Kullanıcı ID'sini isteğe ekliyoruz
    next(); // Fedai onay verdi, içeri geçebilirsin
  } catch (error) {
    res.status(401).json({ error: 'Geçersiz kart!' });
  }
};