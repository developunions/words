// src/app/page.tsx

import InteractiveZone from '@/components/layout/InteractiveZone';
import HowToPlayModal from '@/components/ui/HowToPlayModal';
import { getAllLevels } from '@/lib/data';

// Главный компонент страницы. Теперь он напрямую получает данные.
export default async function HomePage() {
  
  // ИСПРАВЛЕНИЕ: Убрали лишний сетевой запрос. 
  // Теперь серверный компонент напрямую вызывает серверную функцию.
  const levels = await getAllLevels();

  return (
    // Добавляем relative, чтобы позиционировать кнопку "Как играть?"
    <div className="container mx-auto p-4 relative">
      
      {/* ДОБАВЛЯЕМ КОМПОНЕНТ МОДАЛЬНОГО ОКНА */}
      <HowToPlayModal />

      <main className="my-8">
        <InteractiveZone levels={levels} />
      </main>

    </div>
  );
}