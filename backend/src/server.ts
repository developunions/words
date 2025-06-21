import express from 'express';
import cors from 'cors';
import { getAllLevels } from './db/queries';

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// --- МАРШРУТЫ API ---

app.get('/api/levels', async (req, res) => {
  try {
    const levels = await getAllLevels();
    res.json(levels);
  } catch (error) {
    console.error('Ошибка при получении уровней:', error);
    res.status(500).json({ error: 'Не удалось получить список уровней' });
  }
});

app.listen(port, () => {
  console.log(`Backend server listening on port ${port}`);
});