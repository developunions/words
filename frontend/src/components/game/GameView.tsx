// frontend/src/components/game/GameView.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import LetterButtons from './LetterButtons';
import WordGrid from './WordGrid';
import { useProgress } from '@/context/ProgressContext';

function WordBuilder({ word }: { word: string }) {
    // ... (этот компонент не меняется)
    return (
        <div className="my-6 flex justify-center items-center h-16 bg-white border-2 rounded-lg shadow-inner">
            <p className="text-3xl font-bold tracking-[.2em] text-gray-800">
            {word.toUpperCase()}
            </p>
        </div>
    );
}

type GameViewProps = { levelId: number; onBackToMenu: () => void; };
type LevelData = { id: number; baseWord: string; wordsLengths: number[]; };

export default function GameView({ levelId, onBackToMenu }: GameViewProps) {
  const [levelData, setLevelData] = useState<LevelData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentWord, setCurrentWord] = useState('');
  const [usedIndices, setUsedIndices] = useState<number[]>([]);
  const [isShaking, setIsShaking] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  // <<< ИЗМЕНЕНИЕ 1: Получаем весь объект progress из контекста >>>
  const { progress, addFoundWord } = useProgress();
  // Вычисляем найденные слова для ТЕКУЩЕГО уровня на основе общего прогресса
  const foundWords = useMemo(() => progress[levelId] || [], [progress, levelId]);

  // ... (useEffect для загрузки данных остается без изменений) ...
  useEffect(() => { /* ... */ }, [levelId]);

  const letters = useMemo(() => {
    if (!levelData) return [];
    return levelData.baseWord.split('');
  }, [levelData]);

  // ... (все функции-обработчики handleSubmitWord, handleHint и т.д. остаются без изменений) ...
  const handleLetterClick = (letter: string, index: number) => { /* ... */ };
  const handleDeleteLastLetter = () => { /* ... */ };
  const clearInput = () => { /* ... */ };
  const handleSubmitWord = async () => { /* ... */ };
  const handleHint = async () => { /* ... */ };

  // ... (JSX для загрузки и ошибок остается без изменений) ...
  if (isLoading) return <div>Загрузка уровня...</div>;
  if (error) return <div className="text-red-500">Ошибка: {error}</div>;
  if (!levelData) return <div>Уровень не найден.</div>;

  return (
    <div>
      {/* ... */}
      <button onClick={onBackToMenu} className="mb-4 text-gray-500 hover:text-gray-800">
        ← Вернуться к выбору уровня
      </button>
      <div className="p-6 border rounded-lg bg-gray-50">
        <h2 className={`text-3xl font-bold text-center text-gray-800 mb-6 tracking-widest transition-transform duration-500 ${isShaking ? 'animate-shake' : ''}`}>
          {levelData.baseWord.toUpperCase()}
        </h2>

        {/* <<< ИЗМЕНЕНИЕ 2: Передаем в WordGrid актуальный список foundWords >>> */}
        {/* Теперь, когда `progress` изменится, `foundWords` пересчитается, и этот компонент обновится */}
        <WordGrid wordsLengths={levelData.wordsLengths} foundWords={foundWords} />

        <WordBuilder word={currentWord} />
        <div className="flex justify-center items-center gap-2 md:gap-4 mt-8">
          <button onClick={handleHint} title="Подсказка" className="p-3 h-14 bg-yellow-200 rounded-lg text-2xl" disabled={isChecking}>💡</button>
          <LetterButtons letters={letters} usedIndices={usedIndices} onLetterClick={handleLetterClick} />
          <button onClick={handleDeleteLastLetter} title="Удалить" className="p-3 h-14 bg-orange-200 rounded-lg text-2xl" disabled={isChecking}>←</button>
          <button onClick={handleSubmitWord} title="Проверить" className="p-3 h-14 bg-green-200 rounded-lg text-2xl" disabled={isChecking}>✓</button>
        </div>
      </div>
    </div>
  );
}