import prisma from '@/lib/prisma';
import { Difficulty } from '@prisma/client';

type GroupedLevels = {
  [key in Difficulty]: { id: number; wordCount: number }[];
};

export async function getLevelsGroupedByDifficulty() {
  const allLevels = await prisma.level.findMany({
    orderBy: [{ difficulty: 'asc' }, { order: 'asc' }],
    select: { id: true, difficulty: true, order: true, _count: { select: { solutions: true } } },
  });

  const grouped: GroupedLevels = { EASY: [], MEDIUM: [], HARD: [] };
  allLevels.forEach(level => {
    if (grouped[level.difficulty]) {
      grouped[level.difficulty].push({ id: level.id, wordCount: level._count.solutions });
    }
  });
  return grouped;
}

export async function getLevelById(id: number) {
  const level = await prisma.level.findUnique({
    where: { id },
    include: {
      solutions: {
        select: { word: { select: { text: true } } },
        // Сортируем слова, чтобы их порядок был предсказуемым
        orderBy: { word: { text: 'asc' } }
      },
    },
  });

  if (!level) return null;

  return {
    id: level.id,
    baseWord: level.baseWord,
    // Сортируем сначала по длине, потом по алфавиту, чтобы соответствовать логике getSpecificHint
    wordsLengths: level.solutions.map(s => s.word.text).sort((a, b) => a.length - b.length || a.localeCompare(b)).map(w => w.length),
    difficulty: level.difficulty,
    order: level.order,
    totalWords: level.solutions.length,
  };
}

// НОВАЯ ФУНКЦИЯ для конкретной подсказки
export async function getSpecificHint(levelId: number, length: number, indexInGroup: number): Promise<string | null> {
    const level = await prisma.level.findUnique({
        where: { id: levelId },
        include: {
            solutions: {
                select: { word: { select: { text: true } } },
                // Важно: сортировка здесь должна быть такой же, как в getLevelById
                orderBy: { word: { text: 'asc' } }
            }
        },
    });

    if (!level) return null;
    const wordsOfLength = level.solutions.map(s => s.word.text).filter(word => word.length === length);
    const hint = wordsOfLength[indexInGroup];
    if (hint) {
        console.log(`API: Выдана подсказка '${hint}'.`);
        return hint;
    }
    return null;
}

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

export async function checkWordForLevel(levelId: number, wordToCheck: string): Promise<boolean> {
  const solution = await prisma.levelSolution.findFirst({
    where: { levelId: levelId, word: { text: wordToCheck } }
  });
  return !!solution;
}
