// src/components/game/WordGrid.tsx
'use client';
import { useMemo } from 'react';

type WordGridProps = {
  wordsLengths: number[];
  foundWords: string[];
  onHintSelect: (length: number, index: number) => void;
  selectedHintCell: { length: number; index: number } | null;
};

export default function WordGrid({ wordsLengths, foundWords, onHintSelect, selectedHintCell }: WordGridProps) {
  
  // ИСПРАВЛЕНО: Полностью новая, предсказуемая логика для группировки слов
  const groupedWords = useMemo(() => {
    // Создаем структуру для всех ячеек, отсортированных по длине
    const allCells: { length: number; word: string | null; indexInGroup: number }[] = [];
    const lengthCounters: { [key: number]: number } = {};
    wordsLengths.forEach(length => {
      if (lengthCounters[length] === undefined) {
        lengthCounters[length] = 0;
      }
      allCells.push({
        length: length,
        word: null,
        indexInGroup: lengthCounters[length],
      });
      lengthCounters[length]++;
    });

    // Заполняем ячейки найденными словами
    const sortedFoundWords = [...foundWords].sort();
    sortedFoundWords.forEach(foundWord => {
      // Ищем первую пустую ячейку с подходящей длиной и вставляем туда слово
      const cellToFill = allCells.find(cell => cell.length === foundWord.length && cell.word === null);
      if (cellToFill) {
        cellToFill.word = foundWord;
      }
    });

    // Группируем ячейки по длине для отображения
    const groups: { [key: number]: typeof allCells } = {};
    allCells.forEach(cell => {
      if (!groups[cell.length]) {
        groups[cell.length] = [];
      }
      groups[cell.length].push(cell);
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
                const isSelectedForHint = selectedHintCell?.length === length && selectedHintCell?.index === cell.indexInGroup;
                const isHintable = !cell.word;

                return (
                  <div
                    key={`${length}-${index}`}
                    onClick={() => isHintable && onHintSelect(length, cell.indexInGroup)}
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
}
