// frontend/src/components/game/WordGrid.tsx
'use client';
import { useMemo } from 'react';

type WordGridProps = {
  wordsLengths: number[];
  foundWords: string[]; // <-- Возвращаем это свойство
};

export default function WordGrid({ wordsLengths, foundWords }: WordGridProps) {
  // Создаем копию найденных слов, чтобы мы могли "вычеркивать" их
  const remainingFoundWords = useMemo(() => [...foundWords], [foundWords]);

  const groupedWords = useMemo(() => {
    const groups: { [key: number]: { length: number; word: string | null }[] } = {};
    wordsLengths.forEach(length => {
      if (!groups[length]) {
        groups[length] = [];
      }
      // Ищем подходящее найденное слово
      const foundWordIndex = remainingFoundWords.findIndex(w => w.length === length);
      let wordToShow = null;
      if (foundWordIndex > -1) {
        wordToShow = remainingFoundWords[foundWordIndex];
        // Удаляем слово, чтобы оно не попало в другую ячейку той же длины
        remainingFoundWords.splice(foundWordIndex, 1);
      }
      groups[length].push({ length, word: wordToShow });
    });
    return groups;
  }, [wordsLengths, foundWords]);

  return (
    <div className="flex flex-col gap-y-6">
      {Object.keys(groupedWords).map(length => (
        <div key={length}>
          <h4 className="text-sm font-bold text-gray-400 mb-2">
            {length}-буквенные слова ({groupedWords[parseInt(length)].length} шт.)
          </h4>
          <div className="flex flex-wrap gap-x-4 gap-y-3">
            {groupedWords[parseInt(length)].map((cell, index) => (
              <div key={index} className="flex gap-1">
                {Array.from({ length: cell.length }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 flex items-center justify-center font-bold text-xl rounded-md ${
                      cell.word ? 'bg-green-200 text-green-800' : 'bg-gray-200'
                    }`}
                  >
                    {cell.word ? cell.word[i].toUpperCase() : ''}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}