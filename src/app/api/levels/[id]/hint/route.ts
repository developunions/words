import { NextRequest, NextResponse } from 'next/server';
import { getHintByLength } from '@/lib/data';

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

    const { foundWords, length } = await request.json();
    if (!Array.isArray(foundWords) || typeof length !== 'number') {
      return new NextResponse('Некорректный формат запроса', { status: 400 });
    }

    const hint = await getHintByLength(levelId, foundWords, length);
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
