// src/components/layout/InteractiveZone.tsx

type LevelSummary = {
  id: number;
  baseWord: string;
  wordCount: number;
};

export default function InteractiveZone({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full bg-white p-8 rounded-lg shadow-md min-h-[400px]">
      {children}
    </div>
  );
}
