'use client';

import { useState, useEffect, useMemo } from 'react';
import LetterButtons from './LetterButtons';
import WordGrid from './WordGrid';
import { useProgress } from '@/context/ProgressContext';

// --- Вспомогательные компоненты ---

function WordBuilder({ word }: { word: string }) {
  return (
    <div className="my-6 flex justify-center items-center h-16 bg-white border-2 rounded-lg shadow-inner">
      <p className="text-3xl font-bold tracking-[.2em] text-gray-800">
        {word.toUpperCase()}
      </p>
    </div>
  );
}

// --- Типы ---

type GameViewProps = {
  levelId: number;
  onBackToMenu: () => void;
};

type LevelData = {
  id: number;
  baseWord: string;
  wordsLengths: number[];
};

// --- Основной компонент ---

export default function GameView({ levelId, onBackToMenu }: GameViewProps) {
  // --- Состояния компонента (State) ---
  const [levelData, setLevelData] = useState<LevelData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [currentWord, setCurrentWord] = useState('');
  const [usedIndices, setUsedIndices] = useState<number[]>([]);
  const [isShaking, setIsShaking] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  // --- Контекст для прогресса ---
  const { getFoundWords, addFoundWord } = useProgress();
  const foundWords = getFoundWords(levelId);

  // --- Загрузка данных уровня ---
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
  
  // --- Обработка букв ---
  const letters = useMemo(() => {
    if (!levelData) return [];
    return levelData.baseWord.split('');
  }, [levelData]);

  // --- Функции-обработчики действий игрока ---
  const handleLetterClick = (letter: string, index: number) => {
    if (usedIndices.includes(index)) return;
    setCurrentWord(currentWord + letter);
    setUsedIndices([...usedIndices, index]);
  };

  const handleDeleteLastLetter = () => {
    if (currentWord.length === 0) return;
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

  // --- Логика отображения ---
  if (isLoading) return <div>Загрузка уровня...</div>;
  if (error) return <div className="text-red-500">Ошибка: {error}</div>;
  if (!levelData) return <div>Уровень не найден.</div>;

  return (
    <div>
      <button onClick={onBackToMenu} className="mb-4 text-gray-500 hover:text-gray-800">
        ← Вернуться к выбору уровня
      </button>
      <div className="p-6 border rounded-lg bg-gray-50">
        <h2 className={`text-3xl font-bold text-center text-gray-800 mb-6 tracking-widest transition-transform duration-500 ${isShaking ? 'animate-shake' : ''}`}>
          {levelData.baseWord.toUpperCase()}
        </h2>
        
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