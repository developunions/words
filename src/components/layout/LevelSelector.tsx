// src/components/layout/LevelSelector.tsx
import Link from 'next/link';

// Определяем возможные статусы для уровня
export type LevelStatus = 'completed' | 'playable' | 'locked';

// Тип для одного уровня с его статусом
export type LevelWithStatus = {
  id: number;
  wordCount: number;
  order: number;
  status: LevelStatus;
};

// Типы для пропсов компонента
type LevelSelectorProps = {
  easyLevels: LevelWithStatus[];
  mediumLevels: LevelWithStatus[];
  hardLevels: LevelWithStatus[];
  isMediumLocked: boolean;
  isHardLocked: boolean;
};

// Вспомогательный компонент для одной секции уровней
const DifficultySection = ({ title, levels, isLocked }: { title: string, levels: LevelWithStatus[], isLocked: boolean }) => {
  // Функция для определения CSS-классов круга в зависимости от статуса
  const getStatusClasses = (status: LevelStatus): string => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 border-green-600 text-white font-bold';
      case 'playable':
        // Добавляем пульсацию для доступного уровня
        return 'bg-yellow-200 border-yellow-400 animate-pulse';
      case 'locked':
      default:
        // Делаем заблокированные уровни некликабельными
        return 'bg-gray-100 border-gray-200 text-gray-400 pointer-events-none';
    }
  };

  // Функция для рендеринга одного круга уровня
  const renderLevel = (level: LevelWithStatus) => {
    const content = (
      <div
        className={`flex items-center justify-center p-2 border-2 rounded-full aspect-square text-lg font-semibold transition-colors ${getStatusClasses(level.status)}`}
        title={`Уровень ${level.id}`}
      >
        {level.status === 'locked' ? '🔒' : level.id}
      </div>
    );

    // Оборачиваем в ссылку только если уровень не заблокирован
    return level.status !== 'locked' ? (
      <Link href={`/game/${level.id}`} key={level.id}>{content}</Link>
    ) : (
      <div key={level.id}>{content}</div>
    );
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
          {levels.map(renderLevel)}
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
