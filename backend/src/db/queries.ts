import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Получает список всех уровней для экрана выбора.
 * Возвращает только необходимые поля, чтобы не передавать лишние данные.
 */
export async function getAllLevels() {
  console.log('Запрос на получение всех уровней...');
  const levels = await prisma.level.findMany({
    orderBy: {
      id: 'asc', // Сортируем уровни по ID
    },
    select: {
      id: true,
      baseWord: true,
      // Считаем количество решений для каждого уровня
      _count: {
        select: { solutions: true },
      },
    },
  });
  console.log(`Найдено ${levels.length} уровней.`);

  // Преобразуем результат в более удобный формат
  return levels.map(level => ({
    id: level.id,
    baseWord: level.baseWord,
    wordCount: level._count.solutions,
  }));
}

export async function getLevelById(id: number) {
  console.log(`Запрос на получение данных для уровня №${id}...`);
  const level = await prisma.level.findUnique({
    where: { id },
    include: {
      solutions: {
        select: {
          word: {
            select: { text: true },
          },
        },
      },
    },
  });

  if (!level) return null;

  console.log(`Данные для уровня '${level.baseWord}' найдены.`);
  return {
    id: level.id,
    baseWord: level.baseWord,
    // Отдаем только массив длин слов для построения сетки
    wordsLengths: level.solutions.map(s => s.word.text.length).sort((a, b) => a - b),
  };
}