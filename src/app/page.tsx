import HowToPlayModal from '@/components/ui/HowToPlayModal';
import InteractiveZone from '@/components/layout/InteractiveZone';
import LevelSelector, { LevelWithStatus } from '@/components/layout/LevelSelector';
import { getLevelsGroupedByDifficulty } from '@/lib/data';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

type Progress = { [key: number]: string[] };

export default async function HomePage() {
  const levelsByDifficulty = await getLevelsGroupedByDifficulty();

  // Ждём результат cookies()
  const cookieStore = await cookies();
  const progressCookie = cookieStore.get('word-game-progress');

  const progress: Progress = progressCookie?.value
    ? JSON.parse(progressCookie.value)
    : {};

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

  const isMediumLocked = easyLevels.some(l => l.status !== 'completed');
  const isHardLocked   = mediumLevels.some(l => l.status !== 'completed');

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
