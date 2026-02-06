import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient(); // İşte bu satır 'prisma' hatasını çözer!

export const createPost = async (req: any, res: Response) => {
  const { content } = req.body;
  const userId = req.userId; 

  try {
    const newPost = await prisma.post.create({
      data: {
        content: content,
        // userId string geliyorsa onu sayıya çeviriyoruz:
        authorId: Number(userId), 
      },
    });
    res.status(201).json(newPost);
  } catch (error: any) {
    console.error("PRISMA HATASI:", error);
    res.status(500).json({ error: "Post paylaşılamadı." });
  }
};
export const getAllPosts = async (req: any, res: Response) => {
  try {
    const posts = await prisma.post.findMany({
      // DOBRA NOT: Prisma bazen select kullanıldığında authorId'yi gizleyebilir.
      // Her ihtimale karşı authorId'yi de aldığımızdan emin olalım.
      select: {
        id: true,
        content: true,
        createdAt: true,
        authorId: true, // KRİTİK: Terminaldeki 'undefined'ı bu satır sayıya çevirecek!
     
        likeCount: true, // Eğer böyle bir alanın varsa
        author: {
          select: {
            id: true,
            name: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: "Postlar çekilemedi." });
  }
};
export const deletePost = async (req: any, res: Response) => {
  const { id } = req.params; // Silinecek postun ID'si
  const userId = req.userId; // authMiddleware'den gelen senin ID'n

  try {
    // Önce postu bul ve sahibi mi kontrol et
    const post = await prisma.post.findUnique({
      where: { id: Number(id) }
    });

    if (!post) return res.status(404).json({ error: "Post bulunamadı." });
    if (post.authorId !== Number(userId)) return res.status(403).json({ error: "Bu işlem için yetkiniz yok." });

    await prisma.post.delete({
      where: { id: Number(id) }
    });

    res.json({ message: "Post başarıyla silindi." });
  } catch (error) {
    res.status(500).json({ error: "Silme işlemi sırasında hata oluştu." });
  }
};