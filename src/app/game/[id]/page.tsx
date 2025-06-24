// src/app/game/[id]/page.tsx

import GameView from "@/components/game/GameView";

// Тип для props страницы, Next.js передаст сюда `params`.
type GamePageProps = {
  params: {
    id: string;
  };
};

export default function GamePage({ params }: GamePageProps) {
  // Конвертируем id из строки в число
  const levelId = Number(params.id);

  // Проверяем, что ID является корректным числом.
  // Эта проверка важна, если кто-то введет неверный URL.
  if (isNaN(levelId)) {
    return <div className="text-red-500 text-center p-10">Неверный ID уровня.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <main className="my-8">
        {/* ИСПРАВЛЕНО: GameView теперь получает только levelId, как и было запланировано */}
        <GameView levelId={levelId} />
      </main>
    </div>
  );
}
