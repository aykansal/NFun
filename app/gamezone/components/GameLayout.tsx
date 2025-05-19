'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Home, RefreshCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface GameLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
  onStart: () => void;
  onRestart?: () => void;
  gameStarted: boolean;
  score?: number;
  bestScore?: number;
  moves?: number;
  showEndGame?: boolean;
  onEndGame?: () => void;
}

export function GameLayout({
  title,
  description,
  children,
  onStart,
  onRestart,
  gameStarted,
  score,
  bestScore,
  moves,
  showEndGame,
  onEndGame,
}: GameLayoutProps) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 h-full text-white"
    >
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <motion.h1
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="text-4xl font-bold text-[#FF0B7A] mb-4"
          >
            {title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-lg text-[#45D62E] font-ibm mb-4"
          >
            {description}
          </motion.p>

          {(score !== undefined ||
            moves !== undefined ||
            bestScore !== undefined) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center gap-4 mb-4"
            >
              {moves !== undefined && (
                <div className="text-[#FF0B7A]">Moves: {moves}</div>
              )}
              {score !== undefined && (
                <div className="text-[#FF0B7A]">Score: {score}</div>
              )}
              {bestScore !== undefined && (
                <div className="text-[#45D62E] font-ibm">
                  Best Score: {bestScore}
                </div>
              )}
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center gap-4"
          >
            <Button
              onClick={gameStarted ? onRestart : onStart}
              className="bg-[#FF0B7A] hover:bg-[#FF0B7A]/80 text-white px-6 py-2 rounded-full"
            >
              {gameStarted ? (
                <>
                  <RefreshCcw className="mr-2" size={18} />
                  Restart Game
                </>
              ) : (
                'Start Game'
              )}
            </Button>
            {showEndGame && onEndGame && (
              <Button
                onClick={onEndGame}
                className="bg-transparent hover:bg-[#FF0B7A]/10 text-[#FF0B7A] border-2 border-[#FF0B7A] px-6 py-2 rounded-full"
              >
                <Home className="mr-2" size={18} />
                End Game
              </Button>
            )}
            <Button
              onClick={() => router.push('/gamezone')}
              className="bg-transparent hover:bg-[#FF0B7A]/10 text-[#FF0B7A] border-2 border-[#FF0B7A] px-6 py-2 rounded-full"
            >
              <Home className="mr-2" size={18} />
              Back to Games
            </Button>
          </motion.div>
        </header>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {children}
        </motion.div>
      </div>
    </motion.div>
  );
}
