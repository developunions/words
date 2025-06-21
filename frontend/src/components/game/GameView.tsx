// frontend/src/components/game/GameView.tsx
'use client';

type GameViewProps = {
  levelId: number;
  onBackToMenu: () => void; // Функция для возврата в меню выбора уровней
};

export default function GameView({ levelId, onBackToMenu }: GameViewProps) {
  return (
    <div>
      <button onClick={onBackToMenu} className="mb-4 text-blue-500 hover:underline">
        ← Вернуться к выбору уровня
      </button>
      <h2 className="text-2xl font-bold">Игровое поле для уровня №{levelId}</h2>
      <p className="mt-4">Здесь скоро будет игра...</p>
    </div>
  );
}