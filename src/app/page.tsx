// src/app/page.tsx
import HowToPlayModal from '@/components/ui/HowToPlayModal';
import InteractiveZone from '@/components/layout/InteractiveZone';
import LevelSelector, { LevelWithStatus } from '@/components/layout/LevelSelector';
import { getLevelsGroupedByDifficulty } from '@/lib/data';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

type Progress = { [key: number]: string[] };

export default async function HomePage() {
  const levelsByDifficulty = await getLevelsGroupedByDifficulty();
  
  // ИСПРАВЛЕНО: Читаем cookie напрямую в одну строку.
  // Это должно помочь TypeScript правильно определить тип и избежать ошибки сборки.
  const progressCookie = cookies().get('word-game-progress')?.value;
  
  const progress: Progress = progressCookie 
    ? JSON.parse(progressCookie) 
    : {};

  // Вспомогательная функция для определения статуса уровня
  const getLevelStatus = (level: { id: number; wordCount: number }): LevelWithStatus => {
    const foundWordsCount = progress[level.id]?.length || 0;
    let status: 'not-started' | 'started' | 'completed' = 'not-started';

    if (foundWordsCount > 0) {
      status = foundWordsCount === level.wordCount ? 'completed' : 'started';
    }
    
    return { ...level, status };
  };

  const easyLevels = levelsByDifficulty.EASY.map(getLevelStatus);
  const mediumLevels = levelsByDifficulty.MEDIUM.map(getLevelStatus);
  const hardLevels = levelsByDifficulty.HARD.map(getLevelStatus);

  const isMediumLocked = easyLevels.some(level => level.status !== 'completed');
  const isHardLocked = mediumLevels.some(level => level.status !== 'completed');

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
