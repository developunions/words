// frontend/src/components/layout/InteractiveZone.tsx
'use client'; // Эта директива ОБЯЗАТЕЛЬНА, т.к. компонент использует состояние (useState)

import { useState } from 'react';
import LevelSelector from './LevelSelector';
// import GameView from '../game/GameView'; // Мы добавим это на следующем этапе

// Описываем, как выглядят данные одного уровня, которые мы получаем
type LevelSummary = {
  id: number;
  baseWord: string;
  wordCount: number;
};

// Компонент получает первоначальный список уровней от страницы
export default function InteractiveZone({ levels }: { levels: LevelSummary[] }) {
  // Состояние для хранения того, что мы сейчас показываем: 'select' или 'game'
  const [view, setView] = useState('select'); 
  // Состояние для хранения ID выбранного уровня
  const [activeLevelId, setActiveLevelId] = useState<number | null>(null);

  // Функция, которая будет вызываться при клике на уровень в LevelSelector
  const handleLevelSelect = (levelId: number) => {
    console.log(`Пользователь выбрал уровень №${levelId}!`); // Это для тестирования

    // На следующем этапе мы добавим этот код, чтобы переключиться на игру:
    // setActiveLevelId(levelId);
    // setView('game');
  };

  // Логика отображения: показываем либо выбор уровня, либо игру
  return (
    <div className="w-full bg-white p-8 rounded-lg shadow-md">
      {view === 'select' && (
        <LevelSelector levels={levels} onSelectLevel={handleLevelSelect} />
      )}

      {/* {view === 'game' && activeLevelId !== null && (
        <GameView levelId={activeLevelId} />
      )} */}
    </div>
  );
}