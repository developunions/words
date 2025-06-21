// frontend/src/components/game/WordGrid.tsx
'use client';

type WordGridProps = {
  wordsLengths: number[];
};

export default function WordGrid({ wordsLengths }: WordGridProps) {
  const groupedWords: { [key: number]: number[] } = {};
  wordsLengths.forEach(length => {
    if (!groupedWords[length]) {
      groupedWords[length] = [];
    }
    groupedWords[length].push(length);
  });

  return (
    // <<< ИЗМЕНЕНИЕ 1: Увеличиваем отступ между группами слов (gap-y-6) >>>
    <div className="flex flex-col gap-y-6">
      {Object.keys(groupedWords).map(length => (
        <div key={length}>
          {/* <<< ИЗМЕНЕНИЕ 2: Добавляем счетчик слов в заголовок >>> */}
          <h4 className="text-sm font-bold text-gray-400 mb-2">
            {length}-буквенные слова ({groupedWords[parseInt(length)].length} шт.)
          </h4>
          {/* <<< ИЗМЕНЕНИЕ 3: Увеличиваем отступы между ячейками слов >>> */}
          <div className="flex flex-wrap gap-x-4 gap-y-3">
            {groupedWords[parseInt(length)].map((wordLength, index) => (
              <div key={index} className="flex gap-1">
                {Array.from({ length: wordLength }).map((_, i) => (
                  <div key={i} className="w-8 h-8 bg-gray-200 rounded-md" />
                ))}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}