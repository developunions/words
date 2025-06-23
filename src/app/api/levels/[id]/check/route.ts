// /src/app/api/levels/[id]/check/route.ts
import { checkWordForLevel } from '@/lib/data';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  // ИСПРАВЛЕНО: Параметры теперь деструктурируются напрямую
  { params }: { params: { id: string } }
) {
  try {
    const levelId = parseInt(params.id, 10);
    if (isNaN(levelId)) {
        return new NextResponse('Некорректный ID уровня', { status: 400 });
    }
    const { word } = await request.json();

    if (!word) {
      return new NextResponse('Слово не предоставлено', { status: 400 });
    }

    const isCorrect = await checkWordForLevel(levelId, word);
    return NextResponse.json({ correct: isCorrect });
  } catch (error) {
    console.error('Ошибка при проверке слова:', error);
    return new NextResponse('Ошибка при проверке слова', { status: 500 });
  }
}
