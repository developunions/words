// src/components/layout/LevelSelector.tsx
import Link from 'next/link';

// Определяем возможные статусы для уровня
export type LevelStatus = 'not-started' | 'started' | 'completed';

export type LevelWithStatus = {
  id: number;
  wordCount: number;
  status: LevelStatus;
};

type LevelSelectorProps = {
  levels: LevelWithStatus[];
};

// Вспомогательная функция для определения стиля круга
const getStatusClasses = (status: LevelStatus): string => {
  switch (status) {
    case 'completed':
      return 'bg-green-500 border-green-600 text-white font-bold';
    case 'started':
      return 'bg-yellow-200 border-yellow-400';
    case 'not-started':
    default:
      return 'border-gray-200 hover:bg-gray-100 hover:border-gray-400';
  }
};

export default function LevelSelector({ levels }: LevelSelectorProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-700">Выберите уровень</h2>
      <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-4">
        {levels.map((level) => (
          <Link href={`/game/${level.id}`} key={level.id}>
            <div
              className={`flex items-center justify-center p-2 border-2 rounded-full aspect-square text-lg font-semibold text-gray-600 transition-colors cursor-pointer ${getStatusClasses(level.status)}`}
              title={`Уровень ${level.id}`}
            >
              {level.id}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
