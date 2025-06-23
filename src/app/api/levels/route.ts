// src/app/api/levels/route.ts
import { getAllLevels } from '@/lib/data'; // Ваша перенесенная функция
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const levels = await getAllLevels();
    return NextResponse.json(levels);
  } catch (error) {
    return new NextResponse('Не удалось получить список уровней', { status: 500 });
  }
}