import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authMiddleware = (req: any, res: Response, next: NextFunction) => {
  const authHeader = req.header('Authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Giriş kartın yok, giremezsin!' });
  }

  try {
    // DİKKAT: Login'de 'fatma1234' kullandıysan burada da aynısı olmalı!
   const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'fatma1234'); 
  req.userId = decoded.userId;
  next(); 
  } catch (error) {
    // Eğer buraya düşüyorsa token yanlıştır veya anahtar (secret) tutmuyordur
    res.status(401).json({ error: 'Geçersiz veya süresi dolmuş kart!' });
  }
};