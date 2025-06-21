// frontend/src/components/game/GameView.tsx
'use client';

import { useState, useEffect } from 'react';
import LetterButtons from './LetterButtons';
import WordGrid from './WordGrid';

type GameViewProps = {
  levelId: number;
  onBackToMenu: () => void;
};

type LevelData = {
  id: number;
  baseWord: string;
  wordsLengths: number[];
};

export default function GameView({ levelId, onBackToMenu }: GameViewProps) {
  const [levelData, setLevelData] = useState<LevelData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const fetchLevelData = async () => {
      try {
        const res = await fetch(`/api/levels/${levelId}`);
        if (!res.ok) {
          throw new Error('Не удалось загрузить данные уровня');
        }
        const data = await res.json();
        setLevelData(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Произошла неизвестная ошибка');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchLevelData();
  }, [levelId]);

  if (isLoading) {
    return <div>Загрузка уровня...</div>;
  }

  if (error) {
    return <div className="text-red-500">Ошибка: {error}</div>;
  }
  
  if (!levelData) {
    return <div>Уровень не найден.</div>;
  }
  
  const handleLetterClick = (letter: string) => {
    console.log(`Нажата буква: ${letter}`);
  };

  return (
    <div>
      <button onClick={onBackToMenu} className="mb-4 text-gray-500 hover:text-gray-800 transition-colors">
        ← Вернуться к выбору уровня
      </button>
      <div className="p-6 border rounded-lg bg-gray-50">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          {levelData.baseWord.toUpperCase()}
        </h2>
        
        {/* ИСПРАВЛЕНИЕ ЗДЕСЬ: убрали foundWords={[]} */}
        <WordGrid wordsLengths={levelData.wordsLengths} />
        
        <LetterButtons letters={[...new Set(levelData.baseWord)]} onLetterClick={handleLetterClick} />
      </div>
    </div>
  );
}