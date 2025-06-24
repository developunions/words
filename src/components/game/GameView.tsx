// src/components/game/GameView.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import LetterButtons from './LetterButtons';
import WordGrid from './WordGrid';
import { useProgress } from '@/context/ProgressContext';
import GameHeader from './GameHeader';

// ... (вспомогательные компоненты WordBuilder остаются без изменений)
function WordBuilder({ word }: { word: string }) {
  return (
    <div className="my-6 flex justify-center items-center h-16 bg-white border-2 rounded-lg shadow-inner">
      <p className="text-3xl font-bold tracking-[.2em] text-gray-800">
        {word.toUpperCase()}
      </p>
    </div>
  );
}


// ИСПРАВЛЕНО: Убираем onBackToMenu из типов
type GameViewProps = { levelId: number; };
type LevelData = { id: number; baseWord: string; wordsLengths: number[]; };

// Основной компонент
// ИСПРАВЛЕНО: Убираем onBackToMenu из деструктуризации props
export default function GameView({ levelId }: GameViewProps) {
  // Состояния
  const [levelData, setLevelData] = useState<LevelData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentWord, setCurrentWord] = useState('');
  const [usedIndices, setUsedIndices] = useState<number[]>([]);
  const [isShaking, setIsShaking] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  
  const { progress, addFoundWord } = useProgress();
  const foundWords = useMemo(() => progress[levelId] || [], [progress, levelId]);

  // Вся остальная логика компонента (useEffect, обработчики) остается без изменений...
  // Загрузка данных
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    const fetchLevelData = async () => {
      try {
        const res = await fetch(`/api/levels/${levelId}`);
        if (!res.ok) throw new Error('Не удалось загрузить данные уровня');
        const data = await res.json();
        setLevelData(data);
      } catch (err) {
        if (err instanceof Error) setError(err.message);
        else setError('Произошла неизвестная ошибка');
      } finally {
        setIsLoading(false);
      }
    };
    fetchLevelData();
  }, [levelId]);
  
  const letters = useMemo(() => {
    if (!levelData) return [];
    return levelData.baseWord.split('');
  }, [levelData]);

  // Обработчики...
  const handleLetterClick = (letter: string, index: number) => {
    if (usedIndices.includes(index) || isChecking) return;
    setCurrentWord(currentWord + letter);
    setUsedIndices([...usedIndices, index]);
  };

  const handleDeleteLastLetter = () => {
    if (currentWord.length === 0 || isChecking) return;
    setCurrentWord(currentWord.slice(0, -1));
    setUsedIndices(usedIndices.slice(0, -1));
  };
  
  const clearInput = () => {
    setCurrentWord('');
    setUsedIndices([]);
  };

  const handleSubmitWord = async () => {
    if (!currentWord || isChecking || foundWords.includes(currentWord)) {
      clearInput();
      return;
    }
    setIsChecking(true);
    const wordToCheck = currentWord;

    try {
      const res = await fetch(`/api/levels/${levelId}/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: wordToCheck }),
      });
      const { correct } = await res.json();
      if (correct) {
        addFoundWord(levelId, wordToCheck);
      } else {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
      }
    } catch (error) {
      console.error("Ошибка при проверке слова:", error);
    } finally {
      clearInput();
      setIsChecking(false);
    }
  };
  
  const handleHint = async () => {
    if(isChecking) return;
    setIsChecking(true);
    try {
      const res = await fetch(`/api/levels/${levelId}/hint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ foundWords }),
      });
      if (res.ok) {
        const { hint } = await res.json();
        addFoundWord(levelId, hint);
      } else {
        console.log("Подсказок больше нет или произошла ошибка");
      }
    } catch (error) {
      console.error("Ошибка при получении подсказки:", error);
    } finally {
      setIsChecking(false);
    }
  };
  
  // Отрисовка
  if (isLoading) return <div className="text-center p-10">Загрузка уровня...</div>;
  if (error) return <div className="text-red-500 text-center p-10">Ошибка: {error}</div>;
  if (!levelData) return <div className="text-center p-10">Уровень не найден.</div>;

  return (
    <div>
      <GameHeader baseWord={levelData.baseWord} isShaking={isShaking} />
      <div className="p-6 border rounded-lg bg-gray-50">
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