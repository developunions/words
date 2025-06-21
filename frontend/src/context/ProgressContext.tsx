// frontend/src/context/ProgressContext.tsx
'use client';
import { createContext, useState, useEffect, useContext, ReactNode } from 'react';

type ProgressState = {
  [key: number]: string[];
};

// Теперь контекст будет предоставлять сам объект progress
type ProgressContextType = {
  progress: ProgressState;
  addFoundWord: (levelId: number, word: string) => void;
};

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<ProgressState>({});

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

  const addFoundWord = (levelId: number, word: string) => {
    // Создаем новый объект, чтобы React заметил изменение
    const newProgress = { ...progress };
    const levelProgress = newProgress[levelId] || [];

    if (!levelProgress.includes(word)) {
      newProgress[levelId] = [...levelProgress, word];
      setProgress(newProgress);
      localStorage.setItem('wordGameState', JSON.stringify(newProgress));
    }
  };

  // Передаем в value сам объект progress и функцию для его изменения
  return (
    <ProgressContext.Provider value={{ progress, addFoundWord }}>
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