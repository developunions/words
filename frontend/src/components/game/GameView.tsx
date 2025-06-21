// frontend/src/components/game/GameView.tsx
'use client';

import { useState, useEffect } from 'react';
import LetterButtons from './LetterButtons';
import WordGrid from './WordGrid';

type GameViewProps = {
  levelId: number;
  onBackToMenu: () => void;
};

// Описываем структуру данных, которые мы ожидаем от API
type LevelData = {
  id: number;
  baseWord: string;
  wordsLengths: number[];
};

export default function GameView({ levelId, onBackToMenu }: GameViewProps) {
  const [levelData, setLevelData] = useState<LevelData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Этот хук будет выполняться каждый раз, когда меняется levelId
  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const fetchLevelData = async () => {
      try {
        // Делаем запрос к нашему API
        const res = await fetch(`/api/levels/${levelId}`);
        if (!res.ok) {
          throw new Error('Не удалось загрузить данные уровня');
        }
        const data = await res.json();
        setLevelData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLevelData();
  }, [levelId]); // Зависимость от levelId

  // --- Логика отображения ---
  if (isLoading) {
    return <div>Загрузка уровня...</div>;
  }

  if (error) {
    return <div className="text-red-500">Ошибка: {error}</div>;
  }

  if (!levelData) {
    return <div>Уровень не найден.</div>;
  }

  // На этом этапе мы просто выводим буквы в консоль для теста
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
        <WordGrid wordsLengths={levelData.wordsLengths} foundWords={[]} />
        <LetterButtons letters={[...new Set(levelData.baseWord)]} onLetterClick={handleLetterClick} />
      </div>
    </div>
  );
}