// /src/app/api/levels/[id]/route.ts
import { getLevelById } from '@/lib/data';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  // ИСПРАВЛЕНО: Изменен синтаксис получения параметров
  context: { params: { id: string } }
) {
  const { params } = context;
  try {
    const levelId = parseInt(params.id, 10);
    if (isNaN(levelId)) {
      return new NextResponse('Некорректный ID уровня', { status: 400 });
    }

    const levelData = await getLevelById(levelId);

    if (levelData) {
      return NextResponse.json(levelData);
    } else {
      return new NextResponse('Уровень не найден', { status: 404 });
    }
  } catch (error) {
    console.error('Ошибка при получении данных уровня:', error);
    return new NextResponse('Внутренняя ошибка сервера', { status: 500 });
  }
}