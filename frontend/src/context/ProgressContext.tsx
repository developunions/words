// frontend/src/context/ProgressContext.tsx
'use client';
import { createContext, useState, useEffect, useContext, ReactNode } from 'react';

// Описываем, как будет выглядеть наш прогресс: { levelId: ['слово1', 'слово2'], ... }
type ProgressState = {
  [key: number]: string[];
};

// Описываем, что будет предоставлять наш контекст
type ProgressContextType = {
  progress: ProgressState;
  addFoundWord: (levelId: number, word: string) => void;
  getFoundWords: (levelId: number) => string[];
};

// Создаем контекст
const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

// Создаем провайдер, который будет "оборачивать" наше приложение
export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<ProgressState>({});

  // При первой загрузке приложения, пытаемся загрузить прогресс из localStorage
  useEffect(() => {
    try {
      const savedProgress = localStorage.getItem('wordGameState');
      if (savedProgress) {
        setProgress(JSON.parse(savedProgress));
      }
    } catch (error) {
      console.error("Failed to load progress from localStorage", error);
    }
  }, []);

  // Функция для добавления нового слова
  const addFoundWord = (levelId: number, word: string) => {
    const newProgress = { ...progress };
    if (!newProgress[levelId]) {
      newProgress[levelId] = [];
    }
    // Добавляем слово, только если его еще нет
    if (!newProgress[levelId].includes(word)) {
      newProgress[levelId].push(word);
      setProgress(newProgress);
      // Сразу же сохраняем обновленный прогресс в localStorage
      localStorage.setItem('wordGameState', JSON.stringify(newProgress));
    }
  };

  // Функция для получения найденных слов для конкретного уровня
  const getFoundWords = (levelId: number) => {
    return progress[levelId] || [];
  };

  return (
    <ProgressContext.Provider value={{ progress, addFoundWord, getFoundWords }}>
      {children}
    </ProgressContext.Provider>
  );
}

// Создаем кастомный хук для удобного использования контекста
export function useProgress() {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
}