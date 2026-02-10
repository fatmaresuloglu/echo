import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createPost = async (req: any, res: Response) => {
  const { content } = req.body;
  const userId = req.userId;

  try {
    const newPost = await prisma.post.create({
      data: {
        content: content,
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
  const userId = req.userId; // Giriş yapan kullanıcının ID'si

  try {
    const posts = await prisma.post.findMany({
      select: {
        id: true,
        content: true,
        createdAt: true,
        authorId: true,
        author: {
          select: {
            id: true,
            name: true,
          }
        },
        // DOBRA DOKUNUŞ: Beğeni sayısını Like tablosundan çekiyoruz
        _count: {
          select: { likes: true }
        },
        // KRİTİK: Bu postu "BEN" beğendim mi? 
        likes: {
          where: { userId: Number(userId) },
          select: { id: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Veriyi frontend'in sevdiği formata çevirelim
    const formattedPosts = posts.map(post => ({
      ...post,
      likeCount: post._count.likes,
      isLiked: post.likes.length > 0, // Eğer dizide eleman varsa beğenmişimdir
    }));

    res.json(formattedPosts);
  } catch (error) {
    console.error("POST ÇEKME HATASI:", error);
    res.status(500).json({ error: "Postlar çekilemedi." });
  }
};

export const deletePost = async (req: any, res: Response) => {
  const { id } = req.params;
  const userId = req.userId;

  try {
    const post = await prisma.post.findUnique({
      where: { id: Number(id) }
    });

    if (!post) return res.status(404).json({ error: "Post bulunamadı." });
    if (post.authorId !== Number(userId)) return res.status(403).json({ error: "Yetkisiz işlem." });

    // Önce bu posta ait beğenileri sil (SQLite kısıtlaması nedeniyle gerekebilir)
    await prisma.like.deleteMany({ where: { postId: Number(id) } });
    
    await prisma.post.delete({ where: { id: Number(id) } });

    res.json({ message: "Post silindi." });
  } catch (error) {
    res.status(500).json({ error: "Silme hatası." });
  }
};

export const likePost = async (req: any, res: Response) => {
  const { id } = req.params; // Post ID
  const userId = req.userId; // Giriş yapan kullanıcı

  try {
    // 1. Daha önce beğenmiş mi bak (Composite ID kullanıyoruz)
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: Number(userId),
          postId: Number(id),
        },
      },
    });

    if (existingLike) {
      // 2. Varsa sil (Unlike)
      await prisma.like.delete({
        where: { id: existingLike.id },
      });
      return res.json({ liked: false, message: "Beğeni kaldırıldı." });
    } else {
      // 3. Yoksa oluştur (Like)
      await prisma.like.create({
        data: {
          userId: Number(userId),
          postId: Number(id),
        },
      });
      return res.json({ liked: true, message: "Beğenildi." });
    }
  } catch (error) {
    console.error("LIKE İŞLEM HATASI:", error);
    res.status(500).json({ error: "Beğeni işlemi sırasında hata oluştu." });
  }
};