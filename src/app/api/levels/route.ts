// src/app/api/levels/route.ts
import { getAllLevels } from '@/lib/data';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const levels = await getAllLevels();
    return NextResponse.json(levels);
  } catch (error) {
    // ИСПРАВЛЕНО: Используем переменную error
    console.error('Ошибка при получении списка уровней:', error);
    return new NextResponse('Не удалось получить список уровней', { status: 500 });
  }
}
