// src/app/page.tsx
import HowToPlayModal from '@/components/ui/HowToPlayModal';
import InteractiveZone from '@/components/layout/InteractiveZone';
import LevelSelector, { LevelStatus, LevelWithStatus } from '@/components/layout/LevelSelector';
import { getAllLevels } from '@/lib/data';
import { cookies } from 'next/headers'; // <-- Импортируем для чтения cookie на сервере

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // 1. Получаем все уровни из БД
  const allLevels = await getAllLevels();

  // 2. Читаем cookie с прогрессом
  const cookieStore = await cookies();
  const progressCookie = cookieStore.get('word-game-progress')?.value;
  const progress: { [key: number]: string[] } = progressCookie
    ? JSON.parse(progressCookie)
    : {};

  // 3. Определяем статус для каждого уровня
  const levelsWithStatus: LevelWithStatus[] = allLevels.map(level => {
    const foundWordsCount = progress[level.id]?.length || 0;
    let status: LevelStatus = 'not-started';

    if (foundWordsCount > 0) {
      status = foundWordsCount === level.wordCount ? 'completed' : 'started';
    }

    return {
      id: level.id,
      wordCount: level.wordCount,
      status
    };
  });

  // 4. Рендерим страницу
  return (
    <div className="container mx-auto p-4 relative">
      <HowToPlayModal />
      <main className="my-8">
        <InteractiveZone>
          <LevelSelector levels={levelsWithStatus} />
        </InteractiveZone>
      </main>
    </div>
  );
}
