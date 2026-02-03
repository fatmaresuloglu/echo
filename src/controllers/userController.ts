import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Boş bırakmak yerine, config'den okumasını veya URL'yi bilmesini sağlamalıyız
// Prisma v7 runtime expects a constructor argument; pass an empty options object.
const prisma = new PrismaClient({
  __internal: {
    engine: {
      type: 'binary'
    }
  }
} as any);

export const register = async (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: { email, name, password: hashedPassword },
    });
    res.status(201).json({ message: "Kayıt başarılı", user: { id: newUser.id, email: newUser.email } });
  } catch (error) {
    res.status(400).json({ error: "Bu email zaten kayıtlı veya bir hata oluştu!" });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "Kullanıcı bulunamadı" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ error: "Hatalı şifre" });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'gizli-anahtar', { expiresIn: '1h' });

    res.json({ message: "Giriş başarılı", token, user: { id: user.id, name: user.name } });
  }  catch (error: any) {
    console.error("!!! PRISMA HATASI !!!:", error); // Terminale hatayı detaylı basar
    res.status(500).json({ error: "Giriş hatası", details: error.message });
}

};
export const getProfile = async (req: any, res: Response) => {
  try {
    // authMiddleware sayesinde elimizde req.userId var
    const userId = req.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, createdAt: true } // Şifreyi güvenlik için göndermiyoruz!
    });

    if (!user) return res.status(404).json({ error: "Kullanıcı bulunamadı" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Profil bilgileri alınırken hata oluştu" });
  }
};