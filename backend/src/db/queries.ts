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

// В будущем здесь будут и другие функции: getLevelById, checkWord и т.д.