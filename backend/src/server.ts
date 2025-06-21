import express from 'express';
import cors from 'cors';
// Пока оставим только одну функцию, остальные добавим на следующих этапах
import { getAllLevels } from './db/queries';

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// --- МАРШРУТЫ API ---

app.get('/levels', async (req, res) => {
  try {
    const levels = await getAllLevels();
    res.json(levels);
  } catch (error) {
    console.error('Ошибка при получении уровней:', error);
    res.status(500).json({ error: 'Не удалось получить список уровней' });
  }
});

// В будущем здесь будут другие маршруты, например:
// app.get('/levels/:id', ...)
// app.post('/levels/:id/check', ...)

app.listen(port, () => {
  console.log(`Backend server listening on port ${port}`);
});