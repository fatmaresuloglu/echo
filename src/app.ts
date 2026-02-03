import express from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

// Tüm kullanıcı işlemlerini buraya yönlendiriyoruz
app.use('/api/users', userRoutes);

app.get('/ping', (req, res) => res.json({ message: "Sistem tertemiz!" }));

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Sunucu http://localhost:${PORT} adresinde yayında!`));