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
  easyLevels: LevelWithStatus[];
  mediumLevels: LevelWithStatus[];
  hardLevels: LevelWithStatus[];
  isMediumLocked: boolean;
  isHardLocked: boolean;
};

// Компонент для одной секции уровней
const DifficultySection = ({ title, levels, isLocked }: { title: string, levels: LevelWithStatus[], isLocked: boolean }) => {
  const getStatusClasses = (status: LevelStatus): string => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 border-green-600 text-white font-bold ring-2 ring-green-300';
      case 'started':
        return 'bg-yellow-200 border-yellow-400';
      case 'not-started':
      default:
        return 'border-gray-200 hover:bg-gray-100 hover:border-gray-400';
    }
  };

  return (
    <div className="mb-8">
      <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2">{title}</h3>
      {isLocked ? (
        <div className="flex items-center justify-center bg-gray-100 p-8 rounded-lg text-gray-500">
          <span className="text-5xl mr-4">🔒</span>
          <span>Пройдите все предыдущие уровни, чтобы открыть эту секцию.</span>
        </div>
      ) : (
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
      )}
    </div>
  );
};


export default function LevelSelector({ easyLevels, mediumLevels, hardLevels, isMediumLocked, isHardLocked }: LevelSelectorProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-700">Выберите уровень</h2>
      <DifficultySection title="Легкие" levels={easyLevels} isLocked={false} />
      <DifficultySection title="Средние" levels={mediumLevels} isLocked={isMediumLocked} />
      <DifficultySection title="Сложные" levels={hardLevels} isLocked={isHardLocked} />
    </div>
  );
}