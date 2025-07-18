// src/app/api/levels/[id]/specific-hint/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getSpecificHint } from '@/lib/data';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const levelId = parseInt(id, 10);
    if (isNaN(levelId)) {
      return new NextResponse('Некорректный ID уровня', { status: 400 });
    }

    const { length, indexInGroup } = await request.json();
    if (typeof length !== 'number' || typeof indexInGroup !== 'number') {
      return new NextResponse('Некорректный формат запроса', { status: 400 });
    }

    const hint = await getSpecificHint(levelId, length, indexInGroup);
    if (hint) {
      return NextResponse.json({ hint });
    } else {
      return new NextResponse('Не найдено слово для подсказки по этим параметрам', { status: 404 });
    }
  } catch (error) {
    console.error('Ошибка при получении конкретной подсказки:', error);
    return new NextResponse('Внутренняя ошибка сервера', { status: 500 });
  }
}
