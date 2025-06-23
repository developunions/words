// frontend/src/app/page.tsx

import InteractiveZone from '@/components/layout/InteractiveZone';
// import DescriptionBlock from '@/components/layout/DescriptionBlock'; // Добавим позже

// Эта асинхронная функция выполнится на сервере при загрузке страницы
async function getLevels() {
  try {
    // Мы делаем запрос к бэкенду по его внутреннему Docker-имени 'backend'
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

// Главный компонент страницы. Он тоже выполняется на сервере (SSR).
export default async function HomePage() {
  const levels = await getLevels();

  return (
    <div className="container mx-auto p-4">
      {/* Здесь в будущем будет шапка сайта */}

      <main className="my-8">
        <InteractiveZone levels={levels} />
      </main>

      {/* <DescriptionBlock /> */}
      {/* Здесь в будущем будет подвал сайта */}
    </div>
  );
}