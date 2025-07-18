// src/app/api/levels/[id]/specific-hint/route.ts

import { getSpecificHint } from '@/lib/data';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const levelId = parseInt(params.id, 10);
    if (isNaN(levelId)) {
      return new NextResponse('Некорректный ID уровня', { status: 400 });
    }

    // ИЗМЕНЕНО: Теперь получаем и индекс слова в его группе
    const { length, indexInGroup } = await request.json();

    if (typeof length !== 'number' || typeof indexInGroup !== 'number') {
        return new NextResponse('Некорректный формат запроса', { status: 400 });
    }

    // ИЗМЕНЕНО: Вызываем новую функцию для получения конкретного слова
    const hint = await getSpecificHint(levelId, length, indexInGroup);

    if (hint) {
      return NextResponse.json({ hint });
    } else {
      return new NextResponse('Не найдено слово для подсказки по этим параметрам', { status: 404 });
    }
  } catch (error) {
    console.error('Ошибка при получении подсказки:', error);
    return new NextResponse('Внутренняя ошибка сервера', { status: 500 });
  }
}