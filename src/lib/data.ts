import prisma from '@/lib/prisma';
import { Difficulty } from '@prisma/client';

// Определяем тип для сгруппированных уровней
type GroupedLevels = {
  [key in Difficulty]: { id: number; wordCount: number }[];
};

/**
 * ВОССТАНОВЛЕННАЯ ФУНКЦИЯ
 * Получает список всех уровней. Она все еще нужна для API-роута /api/levels,
 * который может использоваться в будущем или для других целей.
 */
export async function getAllLevels() {
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
  return levels.map(level => ({
    id: level.id,
    baseWord: level.baseWord,
    wordCount: level._count.solutions,
  }));
}

/**
 * Получает все уровни и группирует их по сложности.
 */
export async function getLevelsGroupedByDifficulty() {
  console.log('API: Запрос на получение всех уровней, сгруппированных по сложности...');
  const allLevels = await prisma.level.findMany({
    orderBy: [
      { difficulty: 'asc' },
      { order: 'asc' }
    ],
    select: {
      id: true,
      difficulty: true,
      order: true,
      _count: {
        select: { solutions: true },
      },
    },
  });

  // ИСПРАВЛЕНО: Используем правильный тип вместо 'any'
  const grouped: GroupedLevels = {
    EASY: [],
    MEDIUM: [],
    HARD: [],
  };

  allLevels.forEach(level => {
    if (grouped[level.difficulty]) {
      grouped[level.difficulty].push({
        id: level.id,
        wordCount: level._count.solutions,
      });
    }
  });

  return grouped;
}


/**
 * Получает данные для одного уровня по его ID.
 */
export async function getLevelById(id: number) {
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

  return {
    id: level.id,
    baseWord: level.baseWord,
    wordsLengths: level.solutions.map(s => s.word.text.length).sort((a, b) => a - b),
    difficulty: level.difficulty,
    order: level.order,
    totalWords: level.solutions.length,
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
  return !!solution;
}

/**
 * Возвращает одно из еще не отгаданных слов в качестве подсказки.
 */
export async function getHint(levelId: number, foundWords: string[]): Promise<string | null> {
    const level = await prisma.level.findUnique({
        where: { id: levelId },
        include: { solutions: { select: { word: { select: { text: true } } } } },
    });

    if (!level) return null;

    const allSolutionWords = level.solutions.map(s => s.word.text);
    const notFoundWords = allSolutionWords.filter(word => !foundWords.includes(word));

    if (notFoundWords.length === 0) return null;

    const hint = notFoundWords[Math.floor(Math.random() * notFoundWords.length)];
    return hint;
}

/**
 * Находит ID следующего уровня в той же или следующей категории сложности.
 */
export async function getNextLevelId(currentDifficulty: Difficulty, currentOrder: number): Promise<number | null> {
  let nextLevel = await prisma.level.findFirst({
    where: {
      difficulty: currentDifficulty,
      order: currentOrder + 1,
    },
    select: { id: true },
  });

  if (!nextLevel) {
    let nextDifficulty: Difficulty | null = null;
    if (currentDifficulty === 'EASY') nextDifficulty = 'MEDIUM';
    if (currentDifficulty === 'MEDIUM') nextDifficulty = 'HARD';
    
    if (nextDifficulty) {
      nextLevel = await prisma.level.findFirst({
        where: {
          difficulty: nextDifficulty,
          order: 1,
        },
        select: { id: true },
      });
    }
  }

  return nextLevel?.id || null;
}
