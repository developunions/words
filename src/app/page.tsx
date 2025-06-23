// src/app/page.tsx

import InteractiveZone from '@/components/layout/InteractiveZone';
import HowToPlayModal from '@/components/ui/HowToPlayModal';
import { getAllLevels } from '@/lib/data';

// Эта строка решает проблему. Она указывает Next.js, что страница динамическая
// и не должна генерироваться во время сборки.
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const levels = await getAllLevels();

  return (
    <div className="container mx-auto p-4 relative">
      <HowToPlayModal />
      <main className="my-8">
        <InteractiveZone levels={levels} />
      </main>
    </div>
  );
}