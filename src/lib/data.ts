import prisma from '@/lib/prisma';
import { Difficulty } from '@prisma/client';

/**
 * НОВАЯ ФУНКЦИЯ
 * Получает все уровни и группирует их по сложности для главного экрана.
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

  // Группируем уровни в объект
  const grouped = {
    EASY: [] as any[],
    MEDIUM: [] as any[],
    HARD: [] as any[],
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
 * ОБНОВЛЕННАЯ ФУНКЦИЯ
 * Получает данные для одного уровня и информацию для перехода к следующему.
 */
export async function getLevelById(id: number) {
  console.log(`API: Запрос на получение данных для уровня №${id}...`);
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

  console.log(`API: Данные для уровня '${level.baseWord}' найдены.`);
  return {
    id: level.id,
    baseWord: level.baseWord,
    wordsLengths: level.solutions.map(s => s.word.text.length).sort((a, b) => a - b),
    // Новые данные для кнопки "Следующий уровень"
    difficulty: level.difficulty,
    order: level.order,
    totalWords: level.solutions.length,
  };
}

/**
 * НОВАЯ ФУНКЦИЯ
 * Находит ID следующего уровня в той же или следующей категории сложности.
 */
export async function getNextLevelId(currentDifficulty: Difficulty, currentOrder: number): Promise<number | null> {
  // Ищем следующий уровень в текущей сложности
  let nextLevel = await prisma.level.findFirst({
    where: {
      difficulty: currentDifficulty,
      order: currentOrder + 1,
    },
    select: { id: true },
  });

  // Если в текущей сложности уровней больше нет, ищем первый уровень следующей сложности
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

// --- Эти функции остаются без изменений ---

export async function checkWordForLevel(levelId: number, wordToCheck: string): Promise<boolean> {
  const solution = await prisma.levelSolution.findFirst({
    where: { levelId: levelId, word: { text: wordToCheck } }
  });
  return !!solution;
}

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
