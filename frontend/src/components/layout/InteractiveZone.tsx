// frontend/src/components/layout/InteractiveZone.tsx
'use client';

import { useState } from 'react';
import LevelSelector from './LevelSelector';
import GameView from '../game/GameView'; // <-- Теперь мы импортируем и используем GameView

type LevelSummary = {
  id: number;
  baseWord: string;
  wordCount: number;
};

export default function InteractiveZone({ levels }: { levels: LevelSummary[] }) {
  const [view, setView] = useState('select');
  const [activeLevelId, setActiveLevelId] = useState<number | null>(null);

  // Эта функция теперь будет переключать на игровой экран
  const handleLevelSelect = (levelId: number) => {
    console.log(`Переключаемся на уровень №${levelId}!`);
    setActiveLevelId(levelId); // <-- Используем setActiveLevelId
    setView('game');            // <-- Используем setView
  };

  // Эта функция будет возвращать нас обратно к выбору уровня
  const handleBackToMenu = () => {
    setActiveLevelId(null);
    setView('select');
  };

  return (
    <div className="w-full bg-white p-8 rounded-lg shadow-md min-h-[400px]">
      {/* Условие для показа выбора уровней */}
      {view === 'select' && (
        <LevelSelector levels={levels} onSelectLevel={handleLevelSelect} />
      )}

      {/* Условие для показа игрового поля */}
      {view === 'game' && activeLevelId !== null && (
        <GameView levelId={activeLevelId} onBackToMenu={handleBackToMenu} />
      )}
    </div>
  );
}