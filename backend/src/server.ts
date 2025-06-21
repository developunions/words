import express from 'express';
import cors from 'cors';
import { getAllLevels, getLevelById, checkWordForLevel } from './db/queries';

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
    res.status(500).json({ error: 'Не удалось получить список уровней' });
  }
});

app.get('/levels/:id', async (req, res) => {
  try {
    const levelId = parseInt(req.params.id, 10);
    const levelData = await getLevelById(levelId);
    if (levelData) {
      res.json(levelData);
    } else {
      res.status(404).json({ error: 'Уровень не найден' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Не удалось получить данные уровня' });
  }
});

// Маршрут для проверки слова (понадобится на следующем этапе)
app.post('/levels/:id/check', async (req, res) => {
    try {
        const levelId = parseInt(req.params.id, 10);
        const { word } = req.body;
        const isCorrect = await checkWordForLevel(levelId, word);
        res.json({ correct: isCorrect });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка при проверке слова' });
    }
});


app.listen(port, () => {
  console.log(`Backend server listening on port ${port}`);
});