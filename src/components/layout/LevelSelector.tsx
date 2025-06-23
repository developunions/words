// frontend/src/components/layout/LevelSelector.tsx

// Снова описываем типы для ясности кода
type LevelSummary = {
  id: number;
  baseWord: string;
  wordCount: number;
};

type LevelSelectorProps = {
  levels: LevelSummary[];
  onSelectLevel: (id: number) => void; // Функция, которую мы получим от родителя
};

export default function LevelSelector({ levels, onSelectLevel }: LevelSelectorProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-700">Выберите уровень</h2>
      <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-4">
        {levels.map((level) => (
          <button
            key={level.id}
            onClick={() => onSelectLevel(level.id)}
            className="flex items-center justify-center p-2 border-2 border-gray-200 rounded-full aspect-square text-lg font-semibold text-gray-600 hover:bg-gray-100 hover:border-gray-400 transition-colors"
          >
            {level.id}
          </button>
        ))}
      </div>
    </div>
  );
}