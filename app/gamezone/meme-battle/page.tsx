'use client';
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Swords, Shield, Zap } from 'lucide-react';
import type { Meme, MemeCard } from '@/lib/types';
import { Modal } from '@/components/ui/modal';
import { toast } from 'sonner';
import Loader from '@/components/loader';
import { GameLayout } from '../components/GameLayout';

export default function CardGame() {
  const [memes, setMemes] = useState<Meme[]>([]);
  const [playerCards, setPlayerCards] = useState<MemeCard[]>([]);
  const [computerCards, setComputerCards] = useState<MemeCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<MemeCard | null>(null);
  const [computerCard, setComputerCard] = useState<MemeCard | null>(null);
  const [playerScore, setPlayerScore] = useState(0);
  const [computerScore, setComputerScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [battleResult, setBattleResult] = useState<string>('');
  const [roundWinner, setRoundWinner] = useState<'player' | 'computer' | null>(
    null
  );
  const [showGameSummaryModal, setShowGameSummaryModal] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    const fetchMemes = async () => {
      try {
        const response = await axios.get('/api/memes?page=1&limit=20');
        setMemes(response.data.memes);
        console.log(response.data.memes);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching memes:', error);
        setLoading(false);
      }
    };

    fetchMemes();
  }, []);

  const initializeGame = () => {
    if (memes.length < 10) {
      toast.error(
        'Not enough memes to start the game. At least 10 memes are required.'
      );
      console.error(
        'Not enough memes to start the game. At least 10 memes are required.'
      );
      return;
    }

    const shuffledMemes = [...memes].sort(() => Math.random() - 0.5);
    const playerMemes = shuffledMemes.slice(0, 5).map((meme, index) => ({
      id: index,
      imageUrl: meme.cloudinaryUrl,
      power: Math.floor(Math.random() * 10) + 1,
      defense: Math.floor(Math.random() * 10) + 1,
      special: Math.floor(Math.random() * 10) + 1,
      isPlayed: false,
    }));

    const computerMemes = shuffledMemes.slice(5, 10).map((meme, index) => ({
      id: index + 5,
      imageUrl: meme.cloudinaryUrl,
      power: Math.floor(Math.random() * 10) + 1,
      defense: Math.floor(Math.random() * 10) + 1,
      special: Math.floor(Math.random() * 10) + 1,
      isPlayed: false,
    }));

    setPlayerCards(playerMemes);
    setComputerCards(computerMemes);
    setPlayerScore(0);
    setComputerScore(0);
    setGameStarted(true);
    setBattleResult('');
    setRoundWinner(null);
  };

  const handleGameOver = () => {
    setGameOver(true);
    setShowGameSummaryModal(true);
    const finalMessage =
      playerScore > computerScore
        ? "Congratulations! You've won the game!"
        : playerScore < computerScore
          ? 'Game Over! The computer wins!'
          : "It's a tie game!";
    setBattleResult(finalMessage);
  };

  const handleCardSelect = (card: MemeCard) => {
    if (card.isPlayed || gameOver) return;

    setSelectedCard(card);
    console.log(card);

    // Computer selects a random unplayed card
    const availableComputerCards = computerCards.filter((c) => !c.isPlayed);
    if (availableComputerCards.length === 0) {
      handleGameOver();
      return;
    }

    const randomCard =
      availableComputerCards[
        Math.floor(Math.random() * availableComputerCards.length)
      ];
    setComputerCard(randomCard);

    // Battle logic
    const battleScore = calculateBattleScore(card, randomCard);

    // Update scores and mark cards as played
    setPlayerCards((prev) =>
      prev.map((c) => (c.id === card.id ? { ...c, isPlayed: true } : c))
    );
    setComputerCards((prev) =>
      prev.map((c) => (c.id === randomCard.id ? { ...c, isPlayed: true } : c))
    );

    if (battleScore > 0) {
      setPlayerScore((prev) => prev + 1);
      setRoundWinner('player');
      setBattleResult('You win this round!');
    } else if (battleScore < 0) {
      setComputerScore((prev) => prev + 1);
      setRoundWinner('computer');
      setBattleResult('Computer wins this round!');
    } else {
      setBattleResult("It's a tie!");
      setRoundWinner(null);
    }

    // Clear cards after 2 seconds and let the useEffect handle game completion
    setTimeout(() => {
      setSelectedCard(null);
      setComputerCard(null);
      setBattleResult('');
      setRoundWinner(null);
    }, 2000);
  };

  const handleRestart = () => {
    setGameOver(false);
    setShowGameSummaryModal(false);
    initializeGame();
  };

  useEffect(() => {
    const checkGameOver = () => {
      const allPlayerCardsPlayed = playerCards.every((card) => card.isPlayed);
      const allComputerCardsPlayed = computerCards.every(
        (card) => card.isPlayed
      );

      if (allPlayerCardsPlayed || allComputerCardsPlayed) {
        handleGameOver();
      }
    };

    if (gameStarted && !gameOver) {
      checkGameOver();
    }
  }, [playerCards, computerCards, gameStarted, gameOver]);

  if (loading) return <Loader />;

  return (
    <GameLayout
      title="Meme Trading Card Battle"
      description="Battle with your meme cards against the computer!"
      gameStarted={gameStarted}
      score={playerScore}
      bestScore={computerScore}
      onStart={initializeGame}
      onRestart={initializeGame}
      showEndGame={gameStarted}
      onEndGame={handleGameOver}
    >
      {gameStarted && (
        <>
          {/* Battle Area */}
          <div className="mb-8">
            <div className="flex justify-center items-center gap-8 min-h-[300px]">
              <AnimatePresence mode="wait">
                {selectedCard && (
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    className={`relative ${roundWinner === 'player' ? 'ring-4 ring-[#45D62E]' : ''}`}
                  >
                    <MemeCardComponent card={selectedCard} />
                  </motion.div>
                )}
              </AnimatePresence>

              {battleResult && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-2xl font-bold text-[#FF0B7A]"
                >
                  {battleResult}
                </motion.div>
              )}

              <AnimatePresence mode="wait">
                {computerCard && (
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    className={`relative ${roundWinner === 'computer' ? 'ring-4 ring-[#FF0B7A]' : ''}`}
                  >
                    <MemeCardComponent card={computerCard} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Player's Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {playerCards.map((card) => (
              <motion.div
                key={card.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: card.isPlayed ? 1 : 1.05 }}
                className={`${card.isPlayed ? 'opacity-50' : ''}`}
              >
                <MemeCardComponent
                  card={card}
                  onClick={() => !card.isPlayed && handleCardSelect(card)}
                />
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* Game Summary Modal */}
      <Modal
        isOpen={showGameSummaryModal}
        onClose={() => setShowGameSummaryModal(false)}
        title="Game Summary"
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#FF0B7A] mb-4">
            {battleResult}
          </h2>
          <p className="text-lg mb-4">
            Final Score: {playerScore} - {computerScore}
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={handleRestart}
              className="bg-[#FF0B7A] hover:bg-[#FF0B7A]/80 text-white px-6 py-2 rounded-full"
            >
              Play Again
            </button>
          </div>
        </div>
      </Modal>
    </GameLayout>
  );
}

function MemeCardComponent({
  card,
  onClick,
}: {
  card: MemeCard;
  onClick?: () => void;
}) {
  return (
    <Card
      className="bg-[#1A1A1A] border-2 border-[#FF0B7A] overflow-hidden"
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div className="relative w-full h-40">
          <Image
            src={card.imageUrl}
            alt="Meme Card"
            fill
            className="object-cover rounded-lg"
          />
        </div>
        <div className="mt-2 space-y-1">
          <div className="flex items-center justify-between">
            <span className="flex items-center">
              <Swords size={16} className="text-[#FF0B7A] mr-1" />
              {card.power}
            </span>
            <span className="flex items-center">
              <Shield size={16} className="text-[#45D62E] font-ibm mr-1" />
              {card.defense}
            </span>
            <span className="flex items-center">
              <Zap size={16} className="text-[#FF0B7A] mr-1" />
              {card.special}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function calculateBattleScore(playerCard: MemeCard, computerCard: MemeCard) {
  const playerTotal =
    playerCard.power + playerCard.defense + playerCard.special;
  const computerTotal =
    computerCard.power + computerCard.defense + computerCard.special;
  return playerTotal - computerTotal;
}
