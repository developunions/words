// src/components/ui/HowToPlayModal.tsx
'use client';

import { useState } from 'react';

// Иконка для кнопки закрытия
const CloseIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
  </svg>
);

// Текстовый блок для правил
const RuleSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-4">
    <h4 className="font-semibold text-lg text-gray-800 mb-1">{title}</h4>
    <p className="text-gray-600 leading-relaxed">
      {children}
    </p>
  </div>
);

export default function HowToPlayModal() {
  const [isOpen, setIsOpen] = useState(false);

  // Если окно не открыто, ничего не рендерим
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="absolute top-4 right-4 p-2 text-gray-500 hover:text-blue-600 transition-colors"
        title="Как играть?"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      </button>
    );
  }

  // Рендерим модальное окно
  return (
    // Оверлей (полупрозрачный фон)
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4"
      onClick={() => setIsOpen(false)} // Закрытие по клику на фон
    >
      {/* Контейнер модального окна */}
      <div
        className="bg-white rounded-lg shadow-2xl p-6 md:p-8 max-w-2xl w-full relative"
        onClick={(e) => e.stopPropagation()} // Предотвращаем закрытие по клику на само окно
      >
        {/* Кнопка закрытия */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-800 rounded-full transition-colors"
          title="Закрыть"
        >
          <CloseIcon />
        </button>

        {/* Содержимое */}
        <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Как играть
        </h3>
        
        <RuleSection title="Цель игры">
          Найти все существительные, которые можно составить из букв заданного слова-основы.
        </RuleSection>
        
        <RuleSection title="Составление слов">
          На игровом экране вверху вы видите слово-основу. Нажимайте на его буквы в нужной последовательности, чтобы составить новое слово. Оно появится в поле ввода.
        </RuleSection>
        
        <RuleSection title="Проверка и ошибки">
          Когда слово готово, нажмите кнопку с галочкой (✓) для проверки. Если слово верное, оно займет свое место в сетке. Если вы ошиблись, последнюю букву можно стереть кнопкой (←). Если составленного вами слова нет в загаданных, слово-основа наверху экрана слегка покачнется.
        </RuleSection>

        <RuleSection title="Подсказки">
          Если вы не можете угадать какое-то слово, нажмите на кнопку с лампочкой (💡), чтобы открыть случайное неотгаданное слово.
        </RuleSection>
      </div>
    </div>
  );
}
