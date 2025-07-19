// src/app/page.tsx
import HowToPlayModal from '@/components/ui/HowToPlayModal';
import InteractiveZone from '@/components/layout/InteractiveZone';
import LevelSelector, { LevelWithStatus } from '@/components/layout/LevelSelector';
import { getLevelsGroupedByDifficulty } from '@/lib/data';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

type Progress = { [key: number]: string[] };
type Level = { id: number; wordCount: number; order: number; };

export default async function HomePage() {
  const levelsByDifficulty = await getLevelsGroupedByDifficulty();
  
  const cookieStore = await cookies();
  const progressCookie = cookieStore.get('word-game-progress');
  const progress: Progress = progressCookie?.value ? JSON.parse(progressCookie.value) : {};

  // Вспомогательная функция для определения статуса уровня
  const processLevels = (levels: Level[]) => {
    // Находим порядковый номер последнего полностью пройденного уровня
    let lastCompletedOrder = 0;
    for (const level of levels) {
      if ((progress[level.id]?.length || 0) === level.wordCount) {
        lastCompletedOrder = Math.max(lastCompletedOrder, level.order);
      }
    }

    // Если все уровни в секции пройдены, делаем последний уровень "играбельным",
    // чтобы на него можно было зайти снова.
    if (lastCompletedOrder === levels.length) {
      lastCompletedOrder = levels.length - 1;
    }

    // Определяем статус каждого уровня
    return levels.map(level => {
      const isCompleted = (progress[level.id]?.length || 0) === level.wordCount;
      let status: 'completed' | 'playable' | 'locked' = 'locked';

      if (isCompleted) {
        status = 'completed';
      } else if (level.order === lastCompletedOrder + 1) {
        // Следующий уровень после последнего пройденного является играбельным
        status = 'playable';
      }
      
      return { ...level, status };
    });
  };

  const easyLevels = processLevels(levelsByDifficulty.EASY);
  const mediumLevels = processLevels(levelsByDifficulty.MEDIUM);
  const hardLevels = processLevels(levelsByDifficulty.HARD);

  // Логика блокировки секций
  const isMediumLocked = easyLevels.some(l => l.status !== 'completed');
  const isHardLocked = mediumLevels.some(l => l.status !== 'completed');

  return (
    <div className="container mx-auto p-4 relative">
      <HowToPlayModal />
      <main className="my-8">
        <InteractiveZone>
          <LevelSelector
            easyLevels={easyLevels}
            mediumLevels={mediumLevels}
            hardLevels={hardLevels}
            isMediumLocked={isMediumLocked}
            isHardLocked={isHardLocked}
          />
        </InteractiveZone>
      </main>
    </div>
  );
}
