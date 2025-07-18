// src/context/ProgressContext.tsx
'use client';
import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import Cookies from 'js-cookie';

type ProgressState = {
  [key: number]: string[];
};

type ProgressContextType = {
  progress: ProgressState;
  addFoundWord: (levelId: number, word: string) => void;
  // Новая функция для прохождения уровня
  completeLevelProgress: (levelId: number, words: string[]) => void;
};

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);
const PROGRESS_COOKIE_NAME = 'word-game-progress';

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<ProgressState>({});

  useEffect(() => {
    try {
      const savedProgress = Cookies.get(PROGRESS_COOKIE_NAME);
      if (savedProgress) {
        setProgress(JSON.parse(savedProgress));
      }
    } catch (error) {
      console.error("Failed to load progress from cookie", error);
    }
  }, []);

  const updateProgressAndCookie = (newProgress: ProgressState) => {
    setProgress(newProgress);
    Cookies.set(PROGRESS_COOKIE_NAME, JSON.stringify(newProgress), { expires: 365 });
  };

  const addFoundWord = (levelId: number, word: string) => {
    const newProgress = { ...progress };
    const levelProgress = newProgress[levelId] || [];
    if (!levelProgress.includes(word)) {
      newProgress[levelId] = [...levelProgress, word];
      updateProgressAndCookie(newProgress);
    }
  };

  // НОВАЯ ФУНКЦИЯ
  const completeLevelProgress = (levelId: number, words: string[]) => {
    const newProgress = { ...progress };
    newProgress[levelId] = words;
    updateProgressAndCookie(newProgress);
  };

  return (
    <ProgressContext.Provider value={{ progress, addFoundWord, completeLevelProgress }}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
}
