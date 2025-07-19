// src/components/game/GameView.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LetterButtons from '@/components/game/LetterButtons';
import WordGrid from '@/components/game/WordGrid';
import { useProgress } from '@/context/ProgressContext';
import GameHeader from '@/components/game/GameHeader';
import { findNextLevelAction, completeLevelAction } from '@/app/actions';
import { Difficulty } from '@prisma/client';

// Вспомогательный компонент для поля ввода
function WordBuilder({ word }: { word: string }) {
  return (
    <div className="my-6 flex justify-center items-center h-16 bg-white border-2 rounded-lg shadow-inner">
      <p className="text-3xl font-bold tracking-[.2em] text-gray-800">
        {word.toUpperCase()}
      </p>
    </div>
  );
}

// Тип данных, которые мы получаем от API
type LevelData = {
  id: number;
  baseWord: string;
  solutionWords: string[];
  difficulty: Difficulty;
  order: number;
};

export default function GameView({ levelId }: { levelId: number }) {
  const router = useRouter();
  const [levelData, setLevelData] = useState<LevelData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentWord, setCurrentWord] = useState('');
  const [usedIndices, setUsedIndices] = useState<number[]>([]);
  const [isShaking, setIsShaking] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  
  const [isConfirmingSkip, setIsConfirmingSkip] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);
  
  const { progress, addFoundWord, completeLevelProgress } = useProgress();
  const foundWords = useMemo(() => progress[levelId] || [], [progress, levelId]);
  const [nextLevelId, setNextLevelId] = useState<number | null>(null);
  const [selectedHintWord, setSelectedHintWord] = useState<string | null>(null);

  const isLevelComplete = levelData ? foundWords.length === levelData.solutionWords.length : false;

  // Загрузка данных уровня
  useEffect(() => {
    setNextLevelId(null);
    setSelectedHintWord(null);
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

  // Эффект для поиска следующего уровня
  useEffect(() => {
    if (isLevelComplete && levelData) {
      findNextLevelAction(levelData.difficulty, levelData.order).then(setNextLevelId);
    }
  }, [isLevelComplete, levelData]);

  const letters = useMemo(() => levelData?.baseWord.split('') || [], [levelData]);

  // ИСПРАВЛЕНО: Обработчик для пропуска ОДНОГО уровня
  const handleSkipLevel = async () => {
    if (!levelData) return;
    setIsSkipping(true);
    
    const { allWords, nextLevelId } = await completeLevelAction(levelId, levelData.difficulty, levelData.order);
    
    // Обновляем прогресс, передавая все слова уровня
    completeLevelProgress(levelId, allWords);
    
    // Ждем небольшую паузу, чтобы cookie успел сохраниться, и только потом переходим
    setTimeout(() => {
      if (nextLevelId) {
        router.push(`/game/${nextLevelId}`);
      } else {
        alert("Поздравляем! Вы прошли все уровни в игре!");
        router.push('/');
      }
      // Состояния сбрасываются при загрузке нового уровня
    }, 100); // 100ms задержка
  };

  // ... (остальные обработчики без изменений)
  const handleHintSelect = (word: string) => {
    if (selectedHintWord === word) {
      setSelectedHintWord(null);
    } else {
      setSelectedHintWord(word);
    }
  };
  
  const handleHint = () => {
    if (!selectedHintWord) return;
    addFoundWord(levelId, selectedHintWord);
    setSelectedHintWord(null);
  };

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
      <div className="p-6 border rounded-lg bg-gray-50 relative">
        {isLevelComplete ? (
          <div className="text-center my-10 animate-fade-in">
            <h3 className="text-2xl font-bold text-green-600">Уровень пройден!</h3>
            {nextLevelId ? (
              <Link href={`/game/${nextLevelId}`} className="mt-4 inline-block bg-blue-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-600 transition-transform hover:scale-105">
                Следующий уровень →
              </Link>
            ) : (
               <div className="flex flex-col items-center">
                 <p className="mt-4 text-lg">Вы прошли все уровни! Поздравляем!</p>
                 <Link href="/" className="mt-4 inline-block bg-gray-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-600 transition-transform hover:scale-105">
                   Вернуться к выбору уровня
                 </Link>
               </div>
            )}
          </div>
        ) : (
          <>
            <WordGrid 
              solutionWords={levelData.solutionWords} 
              foundWords={foundWords}
              onHintSelect={handleHintSelect}
              selectedHintWord={selectedHintWord}
            />
            <WordBuilder word={currentWord} />
          </>
        )}
        
        <div className="flex justify-center items-center gap-2 md:gap-4 mt-8">
          <button onClick={handleHint} title="Подсказка" className="p-3 h-14 bg-yellow-200 rounded-lg text-2xl" disabled={isChecking || !selectedHintWord}>💡</button>
          <LetterButtons letters={letters} usedIndices={usedIndices} onLetterClick={handleLetterClick} />
          <button onClick={handleDeleteLastLetter} title="Удалить" className="p-3 h-14 bg-orange-200 rounded-lg text-2xl" disabled={isChecking}>←</button>
          <button onClick={handleSubmitWord} title="Проверить" className="p-3 h-14 bg-green-200 rounded-lg text-2xl" disabled={isChecking}>✓</button>
        </div>

        {!isLevelComplete && (
          <div className="text-center mt-8 border-t pt-4">
            <button 
              onClick={() => setIsConfirmingSkip(true)}
              className="text-sm text-gray-500 hover:text-red-600 transition-colors"
            >
              Не могу пройти... Пропустить уровень?
            </button>
          </div>
        )}

        {/* Простой диалог для пропуска одного уровня */}
        {isConfirmingSkip && (
          <div className="absolute inset-0 bg-white bg-opacity-90 flex flex-col justify-center items-center rounded-lg">
            <h4 className="text-xl font-bold mb-4">Пропустить уровень?</h4>
            <p className="text-gray-600 mb-6">Все неотгаданные слова будут открыты.</p>
            <div className="flex gap-4">
              <button onClick={() => setIsConfirmingSkip(false)} disabled={isSkipping} className="px-6 py-2 rounded-lg bg-gray-200 hover:bg-gray-300">Нет</button>
              <button onClick={handleSkipLevel} disabled={isSkipping} className="px-6 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600">{isSkipping ? 'Пропускаем...' : 'Да, пропустить'}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
