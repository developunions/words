// src/app/actions.ts
'use server'; // Эта директива ОБЯЗАТЕЛЬНА для серверных действий

import { getNextLevelId } from "@/lib/data";
import { Difficulty } from "@prisma/client";

/**
 * Это серверное действие, которое можно безопасно вызывать с клиента.
 * Оно находит ID следующего уровня.
 */
export async function findNextLevelAction(currentDifficulty: Difficulty, currentOrder: number): Promise<number | null> {
  const nextLevelId = await getNextLevelId(currentDifficulty, currentOrder);
  return nextLevelId;
}
