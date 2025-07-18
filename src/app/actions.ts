// src/app/actions.ts
'use server'; // Эта директива ОБЯЗАТЕЛЬНА для серверных действий

import { getNextLevelId, getSolutionWordsForLevel } from "@/lib/data";
import { Difficulty } from "@prisma/client";

/**
 * Находит ID следующего уровня.
 * Используется в GameView, когда уровень пройден.
 */
export async function findNextLevelAction(currentDifficulty: Difficulty, currentOrder: number): Promise<number | null> {
  const nextLevelId = await getNextLevelId(currentDifficulty, currentOrder);
  return nextLevelId;
}

/**
 * "Проходит" уровень: находит все его слова и ID следующего уровня.
 * Используется в GameView для кнопки "Пройти уровень".
 */
export async function completeLevelAction(levelId: number, currentDifficulty: Difficulty, currentOrder: number) {
  const allWords = await getSolutionWordsForLevel(levelId);
  const nextLevelId = await getNextLevelId(currentDifficulty, currentOrder);
  
  return { allWords, nextLevelId };
}