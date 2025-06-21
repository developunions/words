// frontend/src/components/game/WordGrid.tsx
'use client';

type WordGridProps = {
  wordsLengths: number[];
  foundWords: string[]; // Пока будет пустым, но понадобится в будущем
};

export default function WordGrid({ wordsLengths, foundWords }: WordGridProps) {
  // Группируем слова по длине
  const groupedWords: { [key: number]: number[] } = {};
  wordsLengths.forEach(length => {
    if (!groupedWords[length]) {
      groupedWords[length] = [];
    }
    groupedWords[length].push(length);
  });

  return (
    <div className="flex flex-col gap-4">
      {Object.keys(groupedWords).map(length => (
        <div key={length}>
          <h4 className="text-sm font-bold text-gray-400 mb-2">{length}-буквенные слова</h4>
          <div className="flex flex-wrap gap-2">
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