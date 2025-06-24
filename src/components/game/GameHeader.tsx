// src/components/game/GameHeader.tsx
'use client';

import Link from 'next/link';

type GameHeaderProps = {
  baseWord: string;
  isShaking: boolean;
};

export default function GameHeader({ baseWord, isShaking }: GameHeaderProps) {
  return (
    <header className="flex items-center justify-between mb-6">
      <Link 
        href="/" 
        className="text-3xl p-2 rounded-full hover:bg-gray-100 transition-colors"
        title="Вернуться к выбору уровня"
      >
        🏠
      </Link>
      
      <h2 
        className={`text-3xl font-bold text-center text-gray-800 tracking-widest transition-transform duration-500 ${
          isShaking ? 'animate-shake' : ''
        }`}
      >
        {baseWord.toUpperCase()}
      </h2>
      
      {/* Пустой div для сохранения центровки заголовка */}
      <div style={{ width: '48px' }}></div>
    </header>
  );
}
