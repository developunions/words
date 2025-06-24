// src/components/layout/LevelSelector.tsx
import Link from 'next/link'; // <-- Импортируем Link

type LevelSummary = {
  id: number;
  baseWord: string;
  wordCount: number;
};

// Убираем onSelectLevel, так как теперь будем использовать ссылки
type LevelSelectorProps = {
  levels: LevelSummary[];
};

export default function LevelSelector({ levels }: LevelSelectorProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-700">Выберите уровень</h2>
      <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-4">
        {levels.map((level) => (
          // Оборачиваем кнопку в Link, который ведет на /game/[id]
          <Link href={`/game/${level.id}`} key={level.id}>
            <div
              className="flex items-center justify-center p-2 border-2 border-gray-200 rounded-full aspect-square text-lg font-semibold text-gray-600 hover:bg-gray-100 hover:border-gray-400 transition-colors cursor-pointer"
            >
              {level.id}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
