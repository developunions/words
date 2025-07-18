// src/app/actions.ts
'use server';

import { getNextLevelId, getSolutionWordsForLevel, getUncompletedLevelsInCategory } from "@/lib/data";
import prisma from "@/lib/prisma"; // Используем единый экземпляр Prisma
import { Difficulty } from "@prisma/client";

type Progress = { [key: number]: string[] };

/**
 * Находит ID следующего уровня.
 */
export async function findNextLevelAction(currentDifficulty: Difficulty, currentOrder: number): Promise<number | null> {
  return await getNextLevelId(currentDifficulty, currentOrder);
}

/**
 * "Проходит" ОДИН уровень: находит все его слова и ID следующего уровня.
 */
export async function completeLevelAction(levelId: number, currentDifficulty: Difficulty, currentOrder: number) {
  const allWords = await getSolutionWordsForLevel(levelId);
  const nextLevelId = await getNextLevelId(currentDifficulty, currentOrder);
  return { allWords, nextLevelId };
}

/**
 * Проверяет, сколько уровней осталось пройти в текущей сложности.
 */
export async function checkRemainingLevelsAction(difficulty: Difficulty, progress: Progress) {
  const allLevelsInCategory = await prisma.level.findMany({
    where: { difficulty },
    include: { _count: { select: { solutions: true } } },
  });

  const completedLevelIds = Object.entries(progress)
    .filter(([levelId, foundWords]) => {
      const level = allLevelsInCategory.find(l => l.id === Number(levelId));
      // Уровень считается пройденным, если он есть в прогрессе и количество найденных слов совпадает
      return level && level._count.solutions === foundWords.length;
    })
    .map(([levelId]) => Number(levelId));

  return allLevelsInCategory.length - completedLevelIds.length;
}

/**
 * Проходит все оставшиеся уровни в категории и находит следующий уровень.
 */
export async function completeCategoryAction(difficulty: Difficulty, progress: Progress) {
  const allLevelsInCategory = await prisma.level.findMany({
    where: { difficulty },
    include: { _count: { select: { solutions: true } } },
    orderBy: { order: 'asc' } // Сортируем для предсказуемости
  });

  const completedLevelIds = Object.entries(progress)
    .filter(([levelId, foundWords]) => {
      const level = allLevelsInCategory.find(l => l.id === Number(levelId));
      return level && level._count.solutions === foundWords.length;
    })
    .map(([levelId]) => Number(levelId));

  const uncompletedLevels = await getUncompletedLevelsInCategory(difficulty, completedLevelIds);

  const progressUpdate: Progress = {};
  for (const level of uncompletedLevels) {
    progressUpdate[level.id] = level.solutions.map(s => s.word.text);
  }

  // Находим следующий уровень после последнего в текущей категории
  const lastLevelInOrder = allLevelsInCategory[allLevelsInCategory.length - 1];
  const nextLevelId = await getNextLevelId(difficulty, lastLevelInOrder.order);

  return { progressUpdate, nextLevelId };
}
