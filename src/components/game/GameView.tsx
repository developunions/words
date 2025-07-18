// src/components/game/GameView.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import LetterButtons from '@/components/game/LetterButtons';
import WordGrid from '@/components/game/WordGrid';
import { useProgress } from '@/context/ProgressContext';
import GameHeader from '@/components/game/GameHeader';
import { findNextLevelAction } from '@/app/actions';
import { Difficulty } from '@prisma/client';

// ... (WordBuilder и типы остаются без изменений)
function WordBuilder({ word }: { word: string }) {
  return (
    <div className="my-6 flex justify-center items-center h-16 bg-white border-2 rounded-lg shadow-inner">
      <p className="text-3xl font-bold tracking-[.2em] text-gray-800">
        {word.toUpperCase()}
      </p>
    </div>
  );
}

type LevelData = {
  id: number;
  baseWord: string;
  wordsLengths: number[];
  difficulty: Difficulty;
  order: number;
  totalWords: number;
};


export default function GameView({ levelId }: { levelId: number }) {
  const [levelData, setLevelData] = useState<LevelData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentWord, setCurrentWord] = useState('');
  const [usedIndices, setUsedIndices] = useState<number[]>([]);
  const [isShaking, setIsShaking] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const { progress, addFoundWord } = useProgress();
  const foundWords = useMemo(() => progress[levelId] || [], [progress, levelId]);
  const [nextLevelId, setNextLevelId] = useState<number | null>(null);
  const [selectedHintCell, setSelectedHintCell] = useState<{ length: number, index: number } | null>(null);

  const isLevelComplete = levelData ? foundWords.length === levelData.totalWords : false;

  useEffect(() => {
    setNextLevelId(null);
    setSelectedHintCell(null);
    const fetchLevelData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/levels/${levelId}`);
        if (!res.ok) throw new Error('Не удалось загрузить данные уровня');
        const data: LevelData = await res.json();
        setLevelData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Произошла неизвестная ошибка');
      } finally {
        setIsLoading(false);
      }
    };
    fetchLevelData();
  }, [levelId]);

  useEffect(() => {
    if (isLevelComplete && levelData) {
      findNextLevelAction(levelData.difficulty, levelData.order).then(setNextLevelId);
    }
  }, [isLevelComplete, levelData]);

  const letters = useMemo(() => levelData?.baseWord.split('') || [], [levelData]);

  const handleHintSelect = (length: number, index: number) => {
    if (selectedHintCell?.length === length && selectedHintCell?.index === index) {
      setSelectedHintCell(null);
    } else {
      setSelectedHintCell({ length, index });
    }
  };
  
  // ОБНОВЛЕННАЯ ЛОГИКА ПОДСКАЗКИ
  const handleHint = async () => {
    if (!selectedHintCell || isChecking) return;

    setIsChecking(true);
    try {
      const res = await fetch(`/api/levels/${levelId}/specific-hint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Передаем и длину, и индекс в группе
          length: selectedHintCell.length,
          indexInGroup: selectedHintCell.index
        }),
      });
      if (res.ok) {
        const { hint } = await res.json();
        addFoundWord(levelId, hint);
      } else {
        console.log("Не удалось получить подсказку для этой ячейки");
      }
    } catch (error) {
      console.error("Ошибка при получении подсказки:", error);
    } finally {
      setSelectedHintCell(null);
      setIsChecking(false);
    }
  };

  // ... (остальные обработчики остаются без изменений)
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

  if (isLoading) return <div className="text-center p-10">Загрузка уровня...</div>;
  if (error) return <div className="text-red-500 text-center p-10">Ошибка: {error}</div>;
  if (!levelData) return <div className="text-center p-10">Уровень не найден.</div>;

  return (
    <div>
      <GameHeader baseWord={levelData.baseWord} isShaking={isShaking} />
      <div className="p-6 border rounded-lg bg-gray-50">
        {isLevelComplete ? (
          <div className="text-center my-10 animate-fade-in">
            <h3 className="text-2xl font-bold text-green-600">Уровень пройден!</h3>
            {nextLevelId ? (
              <Link href={`/game/${nextLevelId}`} className="mt-4 inline-block bg-blue-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-600 transition-transform hover:scale-105">
                Следующий уровень →
              </Link>
            ) : (
              <Link href="/" className="mt-4 inline-block bg-gray-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-600 transition-transform hover:scale-105">
                Вернуться к выбору уровня
              </Link>
            )}
          </div>
        ) : (
          <>
            <WordGrid 
              wordsLengths={levelData.wordsLengths} 
              foundWords={foundWords}
              onHintSelect={handleHintSelect}
              selectedHintCell={selectedHintCell}
            />
            <WordBuilder word={currentWord} />
          </>
        )}
        
        <div className="flex justify-center items-center gap-2 md:gap-4 mt-8">
          <button onClick={handleHint} title="Подсказка" className="p-3 h-14 bg-yellow-200 rounded-lg text-2xl" disabled={isChecking || !selectedHintCell}>💡</button>
          <LetterButtons letters={letters} usedIndices={usedIndices} onLetterClick={handleLetterClick} />
          <button onClick={handleDeleteLastLetter} title="Удалить" className="p-3 h-14 bg-orange-200 rounded-lg text-2xl" disabled={isChecking}>←</button>
          <button onClick={handleSubmitWord} title="Проверить" className="p-3 h-14 bg-green-200 rounded-lg text-2xl" disabled={isChecking}>✓</button>
        </div>
      </div>
    </div>
  );
}
