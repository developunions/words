import prisma from '@/lib/prisma';

const prisma = new PrismaClient();

/**
 * Получает список всех уровней для экрана выбора.
 */
export async function getAllLevels() {
  console.log('API: Запрос на получение всех уровней...');
  const levels = await prisma.level.findMany({
    orderBy: { id: 'asc' },
    select: {
      id: true,
      baseWord: true,
      _count: {
        select: { solutions: true },
      },
    },
  });
  console.log(`API: Найдено ${levels.length} уровней.`);
  return levels.map(level => ({
    id: level.id,
    baseWord: level.baseWord,
    wordCount: level._count.solutions,
  }));
}

/**
 * Получает данные для одного уровня по его ID.
 * Не отправляет на клиент список правильных ответов!
 */
export async function getLevelById(id: number) {
  console.log(`API: Запрос на получение данных для уровня №${id}...`);
  const level = await prisma.level.findUnique({
    where: { id },
    include: {
      solutions: {
        select: {
          word: {
            select: { text: true },
          },
        },
      },
    },
  });

  if (!level) return null;

  console.log(`API: Данные для уровня '${level.baseWord}' найдены.`);
  return {
    id: level.id,
    baseWord: level.baseWord,
    // Отдаем только массив длин слов для построения сетки
    wordsLengths: level.solutions.map(s => s.word.text.length).sort((a, b) => a - b),
  };
}

/**
 * Проверяет, является ли слово правильным для данного уровня.
 */
export async function checkWordForLevel(levelId: number, wordToCheck: string): Promise<boolean> {
  console.log(`API: Проверка слова '${wordToCheck}' для уровня №${levelId}...`);
  const solution = await prisma.levelSolution.findFirst({
    where: {
      levelId: levelId,
      word: {
        text: wordToCheck
      }
    }
  });
  console.log(`API: Слово '${wordToCheck}' ${solution ? 'верное' : 'неверное'}.`);
  return !!solution; // вернет true, если решение найдено, иначе false
}

/**
 * Возвращает одно из еще не отгаданных слов в качестве подсказки.
 */
export async function getHint(levelId: number, foundWords: string[]): Promise<string | null> {
    console.log(`API: Запрос подсказки для уровня №${levelId}...`);
    const level = await prisma.level.findUnique({
        where: { id: levelId },
        include: { solutions: { select: { word: { select: { text: true } } } } },
    });

    if (!level) return null;

    const allSolutionWords = level.solutions.map(s => s.word.text);
    const notFoundWords = allSolutionWords.filter(word => !foundWords.includes(word));

    if (notFoundWords.length === 0) return null; // Все слова найдены

    // Возвращаем случайное из ненайденных слов
    const hint = notFoundWords[Math.floor(Math.random() * notFoundWords.length)];
    console.log(`API: Выдана подсказка '${hint}'.`);
    return hint;
}