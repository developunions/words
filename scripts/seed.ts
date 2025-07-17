// /scripts/seed.ts

import { PrismaClient, Word } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

type LevelData = {
  base_word: string;
  valid_words: string[];
};

type LevelsByDifficulty = {
  easy: LevelData[];
  medium: LevelData[];
  hard: LevelData[];
}

async function main() {
  console.log('Начинаем процесс "посева" базы данных...');

  // Блок очистки старых данных УДАЛЕН.
  // Команда `prisma migrate reset` уже делает это за нас.

  const filePath = path.join(process.cwd(), 'data', 'levels_first.json');
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const levelsByDifficulty: LevelsByDifficulty = JSON.parse(fileContents);
  console.log(`Данные уровней по сложностям загружены.`);

  const allValidWords = new Set<string>();
  Object.values(levelsByDifficulty).flat().forEach(level => {
    level.valid_words.forEach(word => allValidWords.add(word));
  });

  const wordData = Array.from(allValidWords).map((word) => ({ text: word }));
  await prisma.word.createMany({
    data: wordData,
  });
  console.log(`Успешно создано ${wordData.length} уникальных слов в таблице Word.`);
  
  const allWordsFromDb = await prisma.word.findMany();
  const wordMap = new Map(allWordsFromDb.map((word: Word) => [word.text, word.id]));
  console.log('Карта слов (word -> id) создана.');

  console.log('Создание уровней и связей по сложностям...');
  
  for (const [difficulty, levels] of Object.entries(levelsByDifficulty)) {
    console.log(`Создание уровней для сложности: ${difficulty.toUpperCase()}`);
    let order = 1;
    for (const levelData of levels) {
      const validWordsForLevel = levelData.valid_words.filter(w => wordMap.has(w));

      await prisma.level.create({
        data: {
          baseWord: levelData.base_word,
          difficulty: difficulty.toUpperCase() as any, 
          order: order++,
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
  }
  console.log('Все уровни и их связи успешно созданы.');
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