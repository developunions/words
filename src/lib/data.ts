// src/lib/data.ts
import prisma from '@/lib/prisma';
import { Difficulty } from '@prisma/client';

type GroupedLevels = {
  [key in Difficulty]: { id: number; wordCount: number; order: number; }[];
};

/**
 * Получает все уровни и группирует их по сложности для главного экрана.
 */
export async function getLevelsGroupedByDifficulty() {
  const allLevels = await prisma.level.findMany({
    orderBy: [{ difficulty: 'asc' }, { order: 'asc' }],
    select: { id: true, difficulty: true, order: true, _count: { select: { solutions: true } } },
  });

  const grouped: GroupedLevels = { EASY: [], MEDIUM: [], HARD: [] };
  allLevels.forEach(level => {
    if (grouped[level.difficulty]) {
      grouped[level.difficulty].push({
        id: level.id,
        wordCount: level._count.solutions,
        order: level.order,
      });
    }
  });
  return grouped;
}

/**
 * Получает данные для одного уровня по его ID.
 * Отдает полный, отсортированный список слов-ответов.
 */
export async function getLevelById(id: number) {
  const level = await prisma.level.findUnique({
    where: { id },
    include: {
      solutions: {
        select: { word: { select: { text: true } } },
        orderBy: { word: { text: 'asc' } }
      },
    },
  });

  if (!level) return null;

  const solutionWords = level.solutions.map(s => s.word.text)
    .sort((a, b) => a.length - b.length || a.localeCompare(b));

  return {
    id: level.id,
    baseWord: level.baseWord,
    solutionWords: solutionWords,
    difficulty: level.difficulty,
    order: level.order,
  };
}

/**
 * Находит ID следующего уровня в той же или следующей категории сложности.
 */
export async function getNextLevelId(currentDifficulty: Difficulty, currentOrder: number): Promise<number | null> {
  let nextLevel = await prisma.level.findFirst({
    where: { difficulty: currentDifficulty, order: currentOrder + 1 },
    select: { id: true },
  });

  if (!nextLevel) {
    let nextDifficulty: Difficulty | null = null;
    if (currentDifficulty === 'EASY') nextDifficulty = 'MEDIUM';
    if (currentDifficulty === 'MEDIUM') nextDifficulty = 'HARD';
    
    if (nextDifficulty) {
      nextLevel = await prisma.level.findFirst({
        where: { difficulty: nextDifficulty, order: 1 },
        select: { id: true },
      });
    }
  }
  return nextLevel?.id || null;
}

/**
 * Проверяет, является ли слово правильным для данного уровня.
 */
export async function checkWordForLevel(levelId: number, wordToCheck: string): Promise<boolean> {
  const solution = await prisma.levelSolution.findFirst({
    where: { levelId: levelId, word: { text: wordToCheck } }
  });
  return !!solution;
}

/**
 * Получает конкретное слово-подсказку по его длине и позиции в группе.
 */
export async function getSpecificHint(levelId: number, length: number, indexInGroup: number): Promise<string | null> {
    const level = await prisma.level.findUnique({
        where: { id: levelId },
        include: {
            solutions: {
                select: { word: { select: { text: true } } },
                orderBy: { word: { text: 'asc' } }
            }
        },
    });

    if (!level) return null;
    const wordsOfLength = level.solutions.map(s => s.word.text).filter(word => word.length === length);
    const hint = wordsOfLength[indexInGroup];
    if (hint) {
        return hint;
    }
    return null;
}

/**
 * Получает все слова-ответы для указанного уровня (для кнопки "Пройти уровень").
 */
export async function getSolutionWordsForLevel(levelId: number): Promise<string[]> {
  const level = await prisma.level.findUnique({
    where: { id: levelId },
    include: {
      solutions: {
        select: {
          word: { select: { text: true } },
        },
      },
    },
  });

  if (!level) return [];
  return level.solutions.map(s => s.word.text);
}

/**
 * Находит все уровни в категории, которые еще не пройдены.
 */
export async function getUncompletedLevelsInCategory(difficulty: Difficulty, completedLevelIds: number[]) {
  const levels = await prisma.level.findMany({
    where: {
      difficulty: difficulty,
      id: {
        notIn: completedLevelIds, // Исключаем уже пройденные
      },
    },
    include: {
      solutions: {
        select: {
          word: { select: { text: true } },
        },
      },
    },
  });
  return levels;
}
