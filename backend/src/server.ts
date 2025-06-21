import express from 'express';
import cors from 'cors';
import { getAllLevels, getLevelById, checkWordForLevel, getHint } from './db/queries';

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// --- МАРШРУТЫ API ---

// Получить список всех уровней
app.get('/levels', async (req, res) => {
  try {
    const levels = await getAllLevels();
    res.json(levels);
  } catch (error) {
    res.status(500).json({ error: 'Не удалось получить список уровней' });
  }
});

// Получить данные для конкретного уровня
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

// Проверить слово
app.post('/levels/:id/check', async (req, res) => {
    try {
        const levelId = parseInt(req.params.id, 10);
        const { word } = req.body;
        if (!word) {
            return res.status(400).json({ error: 'Слово не предоставлено' });
        }
        const isCorrect = await checkWordForLevel(levelId, word);
        res.json({ correct: isCorrect });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка при проверке слова' });
    }
});

// Получить подсказку
app.post('/levels/:id/hint', async (req, res) => {
    try {
        const levelId = parseInt(req.params.id, 10);
        const { foundWords } = req.body;
        const hint = await getHint(levelId, foundWords || []);
        if (hint) {
          res.json({ hint });
        } else {
          res.status(404).json({ error: 'Больше нет слов для подсказки' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Ошибка при получении подсказки' });
    }
});

app.listen(port, () => {
  console.log(`Backend server listening on port ${port}`);
});