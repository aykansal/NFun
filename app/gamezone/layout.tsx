'use client';

import GameProvider from '@/context/GameContext';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useGame } from '@/context/GameContext';

function GameLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { resetGame } = useGame();

  useEffect(() => {
    resetGame();
  }, [pathname, resetGame]);

  return <>{children}</>;
}

export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GameProvider>
      <GameLayoutContent>{children}</GameLayoutContent>
    </GameProvider>
  );
}
