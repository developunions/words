// src/app/page.tsx

import InteractiveZone from '../components/layout/InteractiveZone';
import HowToPlayModal from '../components/ui/HowToPlayModal';

// Эта асинхронная функция выполнится на сервере при загрузке страницы
async function getLevels() {
  try {
    // ВАЖНО: При запросах на стороне сервера используем полный URL
    // Убедитесь, что порт 3000 совпадает с тем, на котором запускается приложение
    const res = await fetch('http://localhost:3000/api/levels', { 
      cache: 'no-store' // Не кэшируем запрос, чтобы всегда получать свежие данные
    });

    if (!res.ok) {
      throw new Error('Failed to fetch levels');
    }
    return res.json();
  } catch (error) {
    console.error("Не удалось загрузить уровни:", error);
    return []; // Возвращаем пустой массив в случае ошибки
  }
}

// Главный компонент страницы.
export default async function HomePage() {
  const levels = await getLevels();

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
