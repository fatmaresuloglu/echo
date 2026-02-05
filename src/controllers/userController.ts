import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// --- KAYIT OLMA (REGISTER) ---
export const register = async (req: Request, res: Response) => {
  const { email, password, fullName, username } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: { 
        email, 
        username,
        name: fullName, 
        password: hashedPassword 
      },
    });
    res.status(201).json({ message: "Kayıt başarılı", user: { id: newUser.id, email: newUser.email } });
  } catch (error: any) {
    console.error("KAYIT HATASI:", error);
    res.status(400).json({ error: "Bu email veya kullanıcı adı zaten kayıtlı!" });
  }
};

// --- GİRİŞ YAPMA (LOGIN) ---
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "Kullanıcı bulunamadı" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ error: "Hatalı şifre" });

    const token = jwt.sign(
      { userId: String(user.id) }, 
      process.env.JWT_SECRET || 'fatma1234', 
      { expiresIn: '7d' }
    );

    res.json({ 
      message: "Giriş başarılı", 
      token, 
      user: { id: Number(user.id), name: user.name, username: user.username } 
    });
  } catch (error: any) {
    res.status(500).json({ error: "Giriş hatası" });
  }
};

// --- PROFİL BİLGİSİ (GET PROFILE) ---
export const getProfile = async (req: any, res: Response) => {
  try {
    const userId = req.userId;
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      select: { id: true, email: true, name: true, username: true, createdAt: true }
    });
    if (!user) return res.status(404).json({ error: "Kullanıcı bulunamadı" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Profil bilgileri alınamadı" });
  }
};