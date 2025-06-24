// src/components/layout/InteractiveZone.tsx
'use client';

import { useState } from 'react';
import LevelSelector from './LevelSelector';
import GameView from '../game/GameView';

type LevelSummary = {
  id: number;
  baseWord: string;
  wordCount: number;
};

export default function InteractiveZone({ levels }: { levels: LevelSummary[] }) {
  const [view, setView] = useState('select');
  const [activeLevelId, setActiveLevelId] = useState<number | null>(null);

  const handleLevelSelect = (levelId: number) => {
    setActiveLevelId(levelId);
    setView('game');
  };


  return (
    <div className="w-full bg-white p-8 rounded-lg shadow-md min-h-[400px]">
      {view === 'select' && (
        <LevelSelector levels={levels} onSelectLevel={handleLevelSelect} />
      )}

      {/* ИСПРАВЛЕНО: Убрали передачу onBackToMenu */}
      {view === 'game' && activeLevelId !== null && (
        <GameView levelId={activeLevelId} />
      )}
    </div>
  );
}