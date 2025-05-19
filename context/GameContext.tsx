'use client';

import { createContext, useContext, useState, useCallback, useMemo } from 'react';

interface GameContextType {
  score: number;
  setScore: (score: number) => void;
  bestScore: number;
  setBestScore: (score: number) => void;
  isGameStarted: boolean;
  setIsGameStarted: (started: boolean) => void;
  resetGame: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export default function GameProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [isGameStarted, setIsGameStarted] = useState(false);

  const resetGame = useCallback(() => {
    setScore(0);
    setIsGameStarted(false);
  }, []);

  const contextValue = useMemo(
    () => ({
      score,
      setScore,
      bestScore,
      setBestScore,
      isGameStarted,
      setIsGameStarted,
      resetGame,
    }),
    [score, bestScore, isGameStarted, resetGame]
  );

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
