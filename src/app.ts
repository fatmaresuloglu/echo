import express from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes.js';

const app = express();

// 1. CORS ayarı (Frontend bağlantısı için)
app.use(cors());

// 2. JSON OKUYUCU (Bu satır olmazsa 'undefined' hatası alırsın!)
app.use(express.json());

// 3. ROTALAR
app.use('/api/users', userRoutes);

app.get('/ping', (req, res) => res.json({ message: "Sistem tertemiz!" }));

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Sunucu http://localhost:${PORT} adresinde yayında!`));