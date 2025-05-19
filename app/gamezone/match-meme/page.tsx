'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import type { GameCard, Meme } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import Loader from '@/components/loader';
import { Modal } from '@/components/ui/modal';
import { toast } from 'sonner';
import Image from 'next/image';
import { GameLayout } from '../components/GameLayout';

export default function Matchmeme() {
  const [memes, setMemes] = useState<Meme[]>([]);
  const [cards, setCards] = useState<GameCard[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [moves, setMoves] = useState<number>(0);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [score, setScore] = useState<number>(0);
  const [bestScore, setBestScore] = useState<number>(0);
  const [showEndGameModal, setShowEndGameModal] = useState(false);
  const [showGameSummaryModal, setShowGameSummaryModal] = useState(false);

  const [firstCard, setFirstCard] = useState<{
    cardId: string;
    index: number;
  } | null>(null);
  const [secondCard, setSecondCard] = useState<{
    cardId: string;
    index: number;
  } | null>(null);

  useEffect(() => {
    const fetchMemes = async () => {
      try {
        setLoading(true);
        const memes = await axios
          .get('/api/memes?page=1&limit=13')
          .then((res) => res?.data?.memes);

        if (!memes.length) {
          toast.error('No Memes Found! Create Some then try again');
          throw new Error('No memes found');
        }
        console.log(memes);
        setMemes(memes);
      } catch (error) {
        console.error('Error fetching memes:', error);
        toast.error('Failed to load memes. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchMemes();
  }, []);

  // Initialize game
  const initializeGame = () => {
    if (memes.length < 6) {
      toast.error(
        'Not enough memes to start the game. At least 6 memes are required.'
      );
      console.error(
        'Not enough memes to start the game. At least 6 memes are required.'
      );
      return;
    }

    // Select 6 random memes
    const shuffledMemes = [...memes]
      .sort(() => Math.random() - 0.5)
      .slice(0, 6);

    // Create pairs of cards
    const gameCards: GameCard[] = [...shuffledMemes, ...shuffledMemes]
      .map((meme, index) => ({
        id: index,
        cloudinaryUrl: meme.cloudinaryUrl, // Use the secure cloudinary URL
        isFlipped: false,
        isMatched: false,
      }))
      .sort(() => Math.random() - 0.5);

    setCards(gameCards);
    setMatchedPairs(0);
    setMoves(0);
    setScore(0);
    setGameStarted(true);
  };

  const handleCardClick = (cardId: string, index: number) => {
    if (cards[index].isMatched || cards[index].isFlipped) return;
    // Check if two unmatched cards are already flipped
    const flippedUnmatchedCards = cards.filter(
      (card) => card.isFlipped && !card.isMatched
    );
    if (flippedUnmatchedCards.length === 2) return;

    // Flip the clicked card
    const flippedCard = { ...cards[index], isFlipped: true };
    const updatedCards = [...cards];
    updatedCards[index] = flippedCard;
    setCards(updatedCards);

    if (!firstCard) {
      // Set first card
      setFirstCard({ cardId, index });
    } else if (!secondCard && index !== firstCard.index) {
      // Set second card
      setSecondCard({ cardId, index });

      // Check for match
      const firstCardData = cards[firstCard.index];
      const secondCardData = cards[index];

      if (firstCardData.id === secondCardData.id) {
        // It's a match — mark both cards as matched
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card, i) =>
              i === firstCard.index || i === index
                ? { ...card, isMatched: true }
                : card
            )
          );
          setFirstCard(null);
          setSecondCard(null);
        }, 500);
        setScore((prev) => prev + 100);
        setMatchedPairs((prev) => prev + 1);
        setMoves((prev) => prev + 1);
      } else {
        // Not a match — flip both cards back after delay
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card, i) =>
              i === firstCard.index || i === index
                ? { ...card, isFlipped: false }
                : card
            )
          );
          setFirstCard(null);
          setSecondCard(null);
        }, 1000);
        setMoves((prev) => prev + 1);
      }
    }
  };

  // Check for game completion
  useEffect(() => {
    if (gameStarted && matchedPairs === 6) {
      if (score > bestScore) {
        setBestScore(score);
        localStorage.setItem('memeGameBestScore', score.toString());
      }

      setTimeout(() => {
        setShowGameSummaryModal(true);
      }, 1000);
    }
  }, [matchedPairs, score, bestScore, gameStarted]);

  // Handle end game confirmation
  const handleEndGame = () => {
    setShowEndGameModal(true);
  };

  const handleEndGameConfirm = () => {
    setShowEndGameModal(false);
    setShowGameSummaryModal(true);
  };

  // Handle game restart
  const handleRestart = () => {
    setShowGameSummaryModal(false);
    initializeGame();
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <GameLayout
      title="NFToodle Memory Game"
      description="Match the meme pairs to win! Each match is worth 100 points"
      gameStarted={gameStarted}
      score={score}
      bestScore={bestScore}
      moves={moves}
      onStart={initializeGame}
      onRestart={initializeGame}
      showEndGame={gameStarted}
      onEndGame={handleEndGame}
    >
      {gameStarted && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {cards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              whileHover={{ scale: 1.05 }}
              className="aspect-square"
            >
              <Card
                className={`w-full h-full bg-[#1A1A1A] cursor-pointer transition-all duration-500 ${
                  card.isMatched ? 'opacity-60' : ''
                }`}
                // @ts-expect-error ignore for now
                onClick={() => handleCardClick(card.id, index)}
              >
                <CardContent className="p-0 w-full h-full relative">
                  <div
                    className={`w-full h-full transition-all duration-500 transform ${
                      card.isFlipped || card.isMatched
                        ? 'rotate-y-0'
                        : 'rotate-y-180'
                    }`}
                  >
                    <div className="w-full h-full">
                      {card.isFlipped || card.isMatched ? (
                        <Image
                          src={card.cloudinaryUrl}
                          alt="Meme card"
                          fill
                          className="object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#2A2A2A] rounded-lg flex items-center justify-center">
                          <span className="text-4xl">?</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* End Game Confirmation Modal */}
      <Modal
        isOpen={showEndGameModal}
        onClose={() => setShowEndGameModal(false)}
        title="End Game"
      >
        <div className="text-center">
          <p className="text-lg mb-4">
            Are you sure you want to end the game? Your progress will be lost.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setShowEndGameModal(false)}
              className="bg-transparent hover:bg-[#FF0B7A]/10 text-[#FF0B7A] border-2 border-[#FF0B7A] px-6 py-2 rounded-full"
            >
              Cancel
            </button>
            <button
              onClick={handleEndGameConfirm}
              className="bg-[#FF0B7A] hover:bg-[#FF0B7A]/80 text-white px-6 py-2 rounded-full"
            >
              End Game
            </button>
          </div>
        </div>
      </Modal>

      {/* Game Summary Modal */}
      <Modal
        isOpen={showGameSummaryModal}
        onClose={() => setShowGameSummaryModal(false)}
        title="Game Summary"
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#FF0B7A] mb-4">
            {score > bestScore ? 'New High Score! 🎉' : 'Game Complete!'}
          </h2>
          <p className="text-lg mb-4">Final Score: {score} points</p>
          <p className="text-lg mb-4">Moves: {moves}</p>
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
