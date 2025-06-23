// frontend/src/components/game/LetterButtons.tsx
'use client';

type LetterButtonsProps = {
  letters: string[];
  usedIndices: number[]; // Массив индексов использованных букв
  onLetterClick: (letter: string, index: number) => void;
};

export default function LetterButtons({ letters, usedIndices, onLetterClick }: LetterButtonsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {letters.map((letter, index) => {
        const isUsed = usedIndices.includes(index);
        return (
          <button
            key={index}
            onClick={() => onLetterClick(letter, index)}
            disabled={isUsed} // Делаем кнопку неактивной, если она использована
            className={`w-12 h-12 bg-blue-100 text-blue-800 font-bold text-2xl rounded-lg shadow-sm transition-all ${
              isUsed
                ? 'opacity-30 cursor-not-allowed'
                : 'hover:bg-blue-200 hover:scale-110'
            }`}
          >
            {letter.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}