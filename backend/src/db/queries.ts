// /backend/src/db/queries.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Получает список всех уровней для экрана выбора.
 */
export async function getAllLevels() {
  console.log('Запрос на получение всех уровней...');
  const levels = await prisma.level.findMany({
    orderBy: { id: 'asc' },
    select: {
      id: true,
      baseWord: true,
      _count: {
        select: { solutions: true },
      },
    },
  });
  console.log(`Найдено ${levels.length} уровней.`);
  return levels.map(level => ({
    id: level.id,
    baseWord: level.baseWord,
    wordCount: level._count.solutions,
  }));
}

/**
 * Получает данные для одного уровня по его ID.
 */
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
    wordsLengths: level.solutions.map(s => s.word.text.length).sort((a, b) => a - b),
  };
}

/**
 * Проверяет, является ли слово правильным для данного уровня.
 */
export async function checkWordForLevel(levelId: number, wordToCheck: string): Promise<boolean> {
  const solution = await prisma.levelSolution.findFirst({
    where: {
      levelId: levelId,
      word: {
        text: wordToCheck
      }
    }
  });
  return !!solution; // вернет true, если решение найдено, иначе false
}