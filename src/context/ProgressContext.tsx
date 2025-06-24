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
};

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

// Название нашей cookie
const PROGRESS_COOKIE_NAME = 'word-game-progress';

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<ProgressState>({});

  // При первой загрузке компонента читаем данные из cookie
  useEffect(() => {
    try {
      const savedProgress = Cookies.get(PROGRESS_COOKIE_NAME); // <-- 2. Читаем cookie
      if (savedProgress) {
        setProgress(JSON.parse(savedProgress));
      }
    } catch (error) {
      console.error("Failed to load progress from cookie", error);
    }
  }, []);

  const addFoundWord = (levelId: number, word: string) => {
    const newProgress = { ...progress };
    const levelProgress = newProgress[levelId] || [];

    if (!levelProgress.includes(word)) {
      newProgress[levelId] = [...levelProgress, word];
      setProgress(newProgress);
      // 3. Сохраняем прогресс в cookie на 1 год
      Cookies.set(PROGRESS_COOKIE_NAME, JSON.stringify(newProgress), { expires: 365 });
    }
  };

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