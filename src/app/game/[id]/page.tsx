// src/app/game/[id]/page.tsx
'use client'; // Эта страница будет клиентским компонентом

import GameView from "@/components/game/GameView";
import { useRouter } from 'next/navigation';

type GamePageProps = {
  params: {
    id: string;
  };
};

export default function GamePage({ params }: GamePageProps) {
  const router = useRouter();
  const levelId = Number(params.id);

  // Функция для возврата на главный экран.
  // Теперь она не нужна, так как GameHeader использует <Link>,
  // но оставим ее для совместимости с GameView, пока мы его не обновим.
  const handleBackToMenu = () => {
    router.push('/');
  };

  // Проверяем, что ID является числом
  if (isNaN(levelId)) {
    return <div className="text-red-500 text-center p-10">Неверный ID уровня.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <main className="my-8">
        <GameView levelId={levelId} onBackToMenu={handleBackToMenu} />
      </main>
    </div>
  );
}
