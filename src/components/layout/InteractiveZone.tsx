// src/components/layout/InteractiveZone.tsx
'use client';

// Этот компонент теперь является просто стилизованной оберткой для контента.
export default function InteractiveZone({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full bg-white p-8 rounded-lg shadow-md min-h-[400px]">
      {children}
    </div>
  );
}