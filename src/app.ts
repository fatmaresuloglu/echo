import express from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes.js';
import postRoutes from './routes/postRoutes.js';

const app = express();

// 1. CORS ayarı (Frontend bağlantısı için)
app.use(cors());

// 2. JSON OKUYUCU (Bu satır olmazsa 'undefined' hatası alırsın!)
app.use(express.json());

// 3. ROTALAR
app.use('/api/users', userRoutes);

app.get('/ping', (req, res) => res.json({ message: "Sistem tertemiz!" }));
app.use('/api/posts', postRoutes);

const PORT = 5000;
// "0.0.0.0" ekleyerek yerel ağdaki (ve emülatördeki) her cihazın erişmesini sağla
app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Sunucu tüm IP'lerden erişime açık: Port ${PORT}`);
});