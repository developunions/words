// frontend/src/components/game/GameView.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import LetterButtons from './LetterButtons';
import WordGrid from './WordGrid';

// Создаем новый компонент прямо здесь для отображения вводимого слова
function WordBuilder({ word }: { word: string }) {
  return (
    <div className="my-6 flex justify-center items-center h-16 bg-white border-2 rounded-lg">
      <p className="text-3xl font-bold tracking-[.2em] text-gray-800">
        {word.toUpperCase()}
      </p>
    </div>
  );
}

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
  // --- Состояния компонента (State) ---
  const [levelData, setLevelData] = useState<LevelData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // <<< НОВЫЕ СОСТОЯНИЯ ДЛЯ ИГРОВОЙ ЛОГИКИ >>>
  // Слово, которое игрок собирает в данный момент
  const [currentWord, setCurrentWord] = useState('');
  // Массив с индексами уже использованных букв
  const [usedIndices, setUsedIndices] = useState<number[]>([]);
  // Список уже найденных слов для этого уровня
  const [foundWords, setFoundWords] = useState<string[]>([]);
  // Состояние для анимации неверного ответа
  const [isShaking, setIsShaking] = useState(false);

  // Загрузка данных уровня (остается без изменений)
  useEffect(() => {
    setIsLoading(true);
    // ... (остальная логика fetch) ...
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

  // <<< НОВЫЕ ФУНКЦИИ-ОБРАБОТЧИКИ >>>
  const handleLetterClick = (letter: string, index: number) => {
    // Не позволяем нажать на уже использованную букву
    if (usedIndices.includes(index)) return;

    setCurrentWord(currentWord + letter);
    setUsedIndices([...usedIndices, index]);
  };

  const handleDeleteLastLetter = () => {
    if (currentWord.length === 0) return;
    setCurrentWord(currentWord.slice(0, -1));
    setUsedIndices(usedIndices.slice(0, -1));
  };

  const handleSubmitWord = async () => {
    if (!currentWord) return;

    // Отправляем слово на проверку в наш бэкенд API
    const res = await fetch(`/api/levels/${levelId}/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ word: currentWord }),
    });
    const { correct } = await res.json();

    if (correct) {
      // Если слово верное, добавляем его в список найденных
      setFoundWords([...foundWords, currentWord]);
    } else {
      // Если неверное, запускаем анимацию тряски
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500); // Длительность анимации 500мс
    }

    // Очищаем поле ввода в любом случае
    setCurrentWord('');
    setUsedIndices([]);
  };


  if (isLoading) return <div>Загрузка уровня...</div>;
  if (error) return <div className="text-red-500">Ошибка: {error}</div>;
  if (!levelData) return <div>Уровень не найден.</div>;

  return (
    <div>
      <button onClick={onBackToMenu} className="mb-4 text-gray-500 hover:text-gray-800">
        ← Вернуться к выбору уровня
      </button>
      <div className="p-6 border rounded-lg bg-gray-50">
        {/* Анимация тряски добавляется через класс CSS */}
        <h2 className={`text-3xl font-bold text-center text-gray-800 mb-6 tracking-widest transition-transform duration-500 ${isShaking ? 'animate-shake' : ''}`}>
          {levelData.baseWord.toUpperCase()}
        </h2>

        {/* Передаем найденные слова в сетку для отображения */}
        <WordGrid wordsLengths={levelData.wordsLengths} foundWords={foundWords} />

        {/* Поле для составляемого слова */}
        <WordBuilder word={currentWord} />

        {/* Кнопки управления */}
        <div className="flex justify-center items-center gap-4">
          <LetterButtons letters={letters} usedIndices={usedIndices} onLetterClick={handleLetterClick} />
          <button onClick={handleDeleteLastLetter} className="p-3 bg-red-200 rounded-lg">←</button>
          <button onClick={handleSubmitWord} className="p-3 bg-green-200 rounded-lg">✓</button>
        </div>
      </div>
    </div>
  );
}