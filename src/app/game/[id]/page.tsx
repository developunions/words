// src/app/game/[id]/page.tsx
import GameView from "@/components/game/GameView";

interface PageParams {
  id: string;
}

export default async function GamePage(
  { params }: { params: Promise<PageParams> }
) {
  // Дожидаемся параметров маршрута
  const { id } = await params;

  // Конвертируем id в число
  const levelId = Number(id);

  // Проверяем корректность ID
  if (isNaN(levelId)) {
    return (
      <div className="text-red-500 text-center p-10">
        Неверный ID уровня.
      </div>
    );
  }

  // Рендер вида игры
  return (
    <div className="container mx-auto p-4">
      <main className="my-8">
        <GameView levelId={levelId} />
      </main>
    </div>
  );
}
