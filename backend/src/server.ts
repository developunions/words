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

app.get('/levels/:id', async (req, res) => {
  try {
    const levelId = parseInt(req.params.id, 10);
    if (isNaN(levelId)) {
      return res.status(400).json({ error: 'ID уровня должен быть числом' });
    }
    const levelData = await getLevelById(levelId);
    if (levelData) {
      res.json(levelData);
    } else {
      res.status(404).json({ error: 'Уровень не найден' });
    }
  } catch (error) {
    console.error(`Ошибка при получении уровня ${req.params.id}:`, error);
    res.status(500).json({ error: 'Не удалось получить данные уровня' });
  }
});

app.listen(port, () => {
  console.log(`Backend server listening on port ${port}`);
});