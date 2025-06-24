// src/app/game/[id]/page.tsx

import GameView from "@/components/game/GameView";

export default function GamePage({ params }: { params: { id: string } }) {
  
  // Конвертируем id из строки в число
  const levelId = Number(params.id);

  // Проверяем, что ID является корректным числом.
  if (isNaN(levelId)) {
    return <div className="text-red-500 text-center p-10">Неверный ID уровня.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <main className="my-8">
        {/* GameView теперь получает только levelId */}
        <GameView levelId={levelId} />
      </main>
    </div>
  );
}