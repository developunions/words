// frontend/src/components/game/LetterButtons.tsx
'use client';

type LetterButtonsProps = {
  letters: string[];
  onLetterClick: (letter: string) => void;
};

export default function LetterButtons({ letters, onLetterClick }: LetterButtonsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2 mt-8">
      {letters.map((letter, index) => (
        <button
          key={index}
          onClick={() => onLetterClick(letter)}
          className="w-12 h-12 bg-blue-100 text-blue-800 font-bold text-2xl rounded-lg shadow-sm hover:bg-blue-200 transition-colors"
        >
          {letter.toUpperCase()}
        </button>
      ))}
    </div>
  );
}