// src/components/game/WordGrid.tsx
'use client';
import { useMemo } from 'react';

type WordGridProps = {
  // Теперь принимаем полный список слов
  solutionWords: string[];
  foundWords: string[];
  // onHintSelect теперь будет передавать само слово для подсказки
  onHintSelect: (word: string) => void;
  selectedHintWord: string | null;
};

export default function WordGrid({ solutionWords, foundWords, onHintSelect, selectedHintWord }: WordGridProps) {
  
  // Группируем слова по длине для отображения
  const groupedWords = useMemo(() => {
    const groups: { [key: number]: string[] } = {};
    solutionWords.forEach(word => {
      const length = word.length;
      if (!groups[length]) {
        groups[length] = [];
      }
      groups[length].push(word);
    });
    return groups;
  }, [solutionWords]);

  return (
    <div className="flex flex-col gap-y-6">
      {Object.keys(groupedWords).map(lengthStr => {
        const length = parseInt(lengthStr, 10);
        return (
          <div key={length}>
            <h4 className="text-sm font-bold text-gray-400 mb-2">
              {length}-буквенные слова ({groupedWords[length].length} шт.)
            </h4>
            <div className="flex flex-wrap gap-x-4 gap-y-3">
              {groupedWords[length].map((word, index) => {
                const isFound = foundWords.includes(word);
                const isSelectedForHint = selectedHintWord === word;
                const isHintable = !isFound;

                return (
                  <div
                    key={`${length}-${index}`}
                    onClick={() => isHintable && onHintSelect(word)}
                    className={`flex gap-1 rounded-md transition-all ${isHintable ? 'cursor-pointer' : ''} ${isSelectedForHint ? 'ring-2 ring-blue-500' : ''}`}
                  >
                    {Array.from({ length }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-8 h-8 flex items-center justify-center font-bold text-xl rounded-md transition-colors duration-300 ${
                          isFound ? 'bg-green-200 text-green-800' : 'bg-gray-200'
                        }`}
                      >
                        {isFound ? word[i].toUpperCase() : ''}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}