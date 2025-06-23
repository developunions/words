// /src/app/api/levels/[id]/hint/route.ts
import { getHint } from '@/lib/data';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  // ИСПРАВЛЕНО: Изменена структура получения параметров для корректной типизации
  context: { params: { id: string } }
) {
  try {
    const levelId = parseInt(context.params.id, 10);
    if (isNaN(levelId)) {
      return new NextResponse('Некорректный ID уровня', { status: 400 });
    }

    const { foundWords } = await request.json();

    if (!Array.isArray(foundWords)) {
        return new NextResponse('Некорректный формат найденных слов', { status: 400 });
    }

    const hint = await getHint(levelId, foundWords);

    if (hint) {
      return NextResponse.json({ hint });
    } else {
      return new NextResponse('Больше нет слов для подсказки', { status: 404 });
    }
  } catch (error) {
    console.error('Ошибка при получении подсказки:', error);
    return new NextResponse('Внутренняя ошибка сервера', { status: 500 });
  }
}
