import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

// Создаем экземпляр Prisma клиента для взаимодействия с БД
const prisma = new PrismaClient();

// Определяем тип для одного уровня из нашего JSON файла
type LevelData = {
  base_word: string;
  valid_words: string[];
};

async function main() {
  console.log('Начинаем процесс "посева" базы данных...');

  // 1. Очищаем старые данные в правильном порядке, чтобы не нарушать связи
  console.log('Очистка старых данных...');
  await prisma.levelSolution.deleteMany();
  await prisma.word.deleteMany();
  await prisma.level.deleteMany();
  console.log('Старые данные успешно удалены.');

  // 2. Читаем и парсим наш JSON файл с уровнями
  const filePath = path.join(process.cwd(), 'data', 'levels.json');
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const levels: LevelData[] = JSON.parse(fileContents);
  console.log(`Найдено ${levels.length} уровней в levels.json.`);

  // 3. Собираем все уникальные слова-ответы со всех уровней
  const allValidWords = new Set<string>();
  for (const level of levels) {
    for (const word of level.valid_words) {
      allValidWords.add(word);
    }
  }

  // 4. Записываем все уникальные слова в таблицу `Word` одним махом
  const wordData = Array.from(allValidWords).map((word) => ({ text: word }));
  await prisma.word.createMany({
    data: wordData,
  });
  console.log(`Успешно создано ${wordData.length} уникальных слов в таблице Word.`);

  // 5. Создаем "карту" слов для быстрого доступа к их ID
  // Это намного быстрее, чем искать ID каждого слова в цикле.
  const allWordsFromDb = await prisma.word.findMany();
  const wordMap = new Map(allWordsFromDb.map((word) => [word.text, word.id]));
  console.log('Карта слов (word -> id) создана.');

  // 6. Создаем уровни и связи между ними и словами
  console.log('Создание уровней и связей...');
  for (const levelData of levels) {
    await prisma.level.create({
      data: {
        baseWord: levelData.base_word,
        // Используем вложенную запись для создания связей в таблице LevelSolution
        solutions: {
          create: levelData.valid_words.map((wordText) => ({
            word: {
              // Подключаем существующее слово по его ID из нашей карты
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
    // Обязательно закрываем соединение с базой данных
    await prisma.$disconnect();
    console.log('Процесс "посева" завершен. Соединение с БД закрыто.');
  });