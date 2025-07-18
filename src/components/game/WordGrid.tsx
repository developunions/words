// src/components/game/WordGrid.tsx
'use client';
import { useMemo } from 'react';

type WordGridProps = {
  wordsLengths: number[];
  foundWords: string[];
  // Новые props для выбора подсказки
  onHintSelect: (length: number, index: number) => void;
  selectedHintCell: { length: number; index: number } | null;
};

export default function WordGrid({ wordsLengths, foundWords, onHintSelect, selectedHintCell }: WordGridProps) {
  const groupedWords = useMemo(() => {
    const remainingFoundWords = [...foundWords];
    const groups: { [key: number]: { length: number; word: string | null }[] } = {};
    
    wordsLengths.forEach(length => {
      if (!groups[length]) {
        groups[length] = [];
      }
      
      const foundWordIndex = remainingFoundWords.findIndex(w => w.length === length);
      let wordToShow = null;
      if (foundWordIndex > -1) {
        wordToShow = remainingFoundWords[foundWordIndex];
        remainingFoundWords.splice(foundWordIndex, 1);
      }
      groups[length].push({ length, word: wordToShow });
    });
    return groups;
  }, [wordsLengths, foundWords]);

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
              {groupedWords[length].map((cell, index) => {
                const isSelectedForHint = selectedHintCell?.length === length && selectedHintCell?.index === index;
                const isHintable = !cell.word;

                return (
                  <div
                    key={index}
                    onClick={() => isHintable && onHintSelect(length, index)}
                    className={`flex gap-1 rounded-md transition-all ${isHintable ? 'cursor-pointer' : ''} ${isSelectedForHint ? 'ring-2 ring-blue-500' : ''}`}
                  >
                    {Array.from({ length: cell.length }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-8 h-8 flex items-center justify-center font-bold text-xl rounded-md transition-colors duration-300 ${
                          cell.word ? 'bg-green-200 text-green-800' : 'bg-gray-200'
                        }`}
                      >
                        {cell.word ? cell.word[i].toUpperCase() : ''}
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