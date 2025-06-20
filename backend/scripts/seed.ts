// /backend/scripts/seed.ts

// ИЗМЕНЕНИЕ 1: Импортируем не только PrismaClient, но и тип 'Word'
import { PrismaClient, Word } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

type LevelData = {
  base_word: string;
  valid_words: string[];
};

async function main() {
  console.log('Начинаем процесс "посева" базы данных...');

  console.log('Очистка старых данных...');
  await prisma.levelSolution.deleteMany();
  await prisma.word.deleteMany();
  await prisma.level.deleteMany();
  console.log('Старые данные успешно удалены.');

  // Путь к файлу теперь внутри папки backend
  const filePath = path.join(__dirname, '..', 'data', 'levels.json');
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const levels: LevelData[] = JSON.parse(fileContents);
  console.log(`Найдено ${levels.length} уровней в levels.json.`);

  const allValidWords = new Set<string>();
  for (const level of levels) {
    for (const word of level.valid_words) {
      allValidWords.add(word);
    }
  }

  const wordData = Array.from(allValidWords).map((word) => ({ text: word }));
  await prisma.word.createMany({
    data: wordData,
  });
  console.log(`Успешно создано ${wordData.length} уникальных слов в таблице Word.`);

  const allWordsFromDb = await prisma.word.findMany();

  // ИЗМЕНЕНИЕ 2: Явно указываем тип для 'word' -> (word: Word)
  const wordMap = new Map(allWordsFromDb.map((word: Word) => [word.text, word.id]));
  console.log('Карта слов (word -> id) создана.');

  console.log('Создание уровней и связей...');
  for (const levelData of levels) {
    // Пропускаем слова, которых нет в нашей карте (на всякий случай)
    const validWordsForLevel = levelData.valid_words.filter(w => wordMap.has(w));

    await prisma.level.create({
      data: {
        baseWord: levelData.base_word,
        solutions: {
          create: validWordsForLevel.map((wordText) => ({
            word: {
              connect: {
                id: wordMap.get(wordText),
              },
            },
          })),
        },
      },
    });
  }
  console.log(`Все ${levels.length} уровней и их связи успешно созданы.`);
}

main()
  .catch((e) => {
    console.error('Произошла ошибка во время "посева":', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('Процесс "посева" завершен. Соединение с БД закрыто.');
  });