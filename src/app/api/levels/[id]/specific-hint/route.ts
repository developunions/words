// src/app/api/levels/[id]/specific-hint/route.ts

import { getHintByLength } from '@/lib/data';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  context: { params: { id: string } }
) {
  const { params } = context;
  try {
    const levelId = parseInt(params.id, 10);
    if (isNaN(levelId)) {
      return new NextResponse('Некорректный ID уровня', { status: 400 });
    }

    const { foundWords, length } = await request.json();

    if (!Array.isArray(foundWords) || typeof length !== 'number') {
        return new NextResponse('Некорректный формат запроса', { status: 400 });
    }

    const hint = await getHintByLength(levelId, foundWords, length);

    if (hint) {
      return NextResponse.json({ hint });
    } else {
      return new NextResponse('Не найдено слов для подсказки с такой длиной', { status: 404 });
    }
  } catch (error) {
    console.error('Ошибка при получении подсказки:', error);
    return new NextResponse('Внутренняя ошибка сервера', { status: 500 });
  }
}