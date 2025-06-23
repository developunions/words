import { getLevelById } from '@/lib/data';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const levelId = parseInt(id, 10);
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
