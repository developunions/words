// src/app/page.tsx
import HowToPlayModal from '@/components/ui/HowToPlayModal';
import InteractiveZone from '@/components/layout/InteractiveZone';
import LevelSelector from '@/components/layout/LevelSelector';
import { getAllLevels } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const levels = await getAllLevels();

  return (
    <div className="container mx-auto p-4 relative">
      <HowToPlayModal />
      <main className="my-8">
        <InteractiveZone>
          <LevelSelector levels={levels} />
        </InteractiveZone>
      </main>
    </div>
  );
}