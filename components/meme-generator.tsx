'use client';
import { useRef, useState, useEffect } from 'react';

import axios from 'axios';
import { motion } from 'framer-motion';
import { Type, Wand2, Sticker, Download, Crown } from 'lucide-react';

import type { MemeGeneratorProps } from '@/lib/types';
import { squidGameVariants } from '@/lib/data';

import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsContent, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { buttonVariants, cardVariants } from '@/styles/animations';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

import { useAuth } from '@/contexts/AuthContext';
import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { useWallet } from '@lazorkit/wallet';

// Enhanced Squid Game themed elements
const SQUID_ELEMENTS = {
  emojis: {
    circle: '⭕️',
    triangle: '🔺',
    square: '⬛',
    mask: '🎭',
    guard: '👥',
    doll: '🎎',
    cookie: '🍪',
    money: '💰',
    gun: '🔫',
    skull: '💀',
    glass: '🪟',
    umbrella: '☂️',
  },
  filters: {
    redLight: {
      name: 'Red Light',
      filter:
        'brightness(120%) saturate(180%) hue-rotate(340deg) contrast(130%) sepia(20%)',
      // Creates an intense red atmosphere with enhanced contrast
    },
    greenLight: {
      name: 'Green Light',
      filter:
        'brightness(115%) saturate(140%) hue-rotate(85deg) contrast(120%) sepia(15%)',
      // Vivid green with slight warmth
    },
    arenaMode: {
      name: 'Arena',
      filter:
        'contrast(140%) brightness(85%) saturate(120%) sepia(30%) hue-rotate(15deg)',
      // Dark, gritty look with enhanced contrast
    },
    neonNight: {
      name: 'Neon Night',
      filter:
        'brightness(130%) contrast(140%) saturate(200%) hue-rotate(190deg)',
      // Cyberpunk-style with intense colors
    },
    dollScene: {
      name: 'Doll Scene',
      filter:
        'sepia(50%) brightness(105%) contrast(130%) saturate(140%) hue-rotate(305deg)',
      // Creepy vintage look with purple tint
    },
    glassGame: {
      name: 'Glass Bridge',
      filter:
        'brightness(110%) contrast(120%) saturate(110%) blur(0.4px) hue-rotate(10deg)',
      // Subtle glass effect with slight blur
    },
    vhs: {
      name: 'VHS Style',
      filter:
        'contrast(150%) brightness(95%) saturate(130%) sepia(20%) hue-rotate(5deg)',
      // Retro VHS look
    },
    nightmare: {
      name: 'Nightmare',
      filter:
        'contrast(160%) brightness(80%) saturate(160%) hue-rotate(270deg) grayscale(30%)',
      // Dark and ominous
    },
    synthwave: {
      name: 'Synthwave',
      filter:
        'brightness(120%) contrast(140%) saturate(180%) hue-rotate(220deg)',
      // 80s synthwave aesthetic
    },
    elimination: {
      name: 'Elimination',
      filter:
        'contrast(150%) brightness(90%) saturate(170%) sepia(40%) hue-rotate(320deg)',
      // Dramatic red-tinted elimination scene
    },
  },
  fonts: {
    impact: 'Impact',
    squidGame: 'SquidGame',
    pixel: 'Press Start 2P',
    future: 'Orbitron',
  },
  captions: [
    "Red light... 🔴 Green light... 🟢 You won't escape!",
    "The game isn't over yet... 🦑 The real challenge begins now!",
    'Choose wisely, your next move could cost you everything 🎮',
    'The Front Man sees all 👁️ but can you escape his gaze?',
    '456 reasons to play again... but no promises of survival 🎲',
    'Glass stepping stones... Choose or lose! 🪟 Are you brave enough?',
    'Honeycomb challenge accepted 🍯 Break the cookie or break your fate.',
    'Tug of war champion 🏆 Who will survive the final pull?',
    'Marbles: friend or foe? 🔮 Will you win with a friend, or alone?',
    "Final round: Squid Game 🦑 There's no going back now...",
  ],
};

// const connection = new Connection('https://rpc.lazorkit.xyz/', {
//   wsEndpoint: 'https://rpc.lazorkit.xyz/ws/',
//   commitment: 'confirmed',
//   confirmTransactionInitialTimeout: 60000,
// });
// const keypair = Keypair2.fromSecretKey(
//   new Uint8Array([
//     91, 139, 202, 42, 20, 31, 61, 11, 170, 237, 184, 147, 253, 10, 63, 240, 131,
//     46, 231, 211, 253, 181, 58, 104, 242, 192, 0, 143, 19, 252, 47, 158, 219,
//     165, 97, 103, 220, 26, 173, 243, 207, 52, 18, 44, 64, 84, 249, 104, 158,
//     221, 84, 61, 36, 240, 55, 20, 76, 59, 142, 34, 100, 132, 243, 236,
//   ])
// );

export function MemeGenerator({ defaultImage }: MemeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [topText, setTopText] = useState('TOP TEXT');
  const [bottomText, setBottomText] = useState('BOTTOM TEXT');
  const [fontSize, setFontSize] = useState(25);
  const [textColor, setTextColor] = useState('#FF0B7A');
  const [textEffect, setTextEffect] = useState('none');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [selectedEmoji, setSelectedEmoji] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<string>('none');
  const [selectedFont, setSelectedFont] = useState('impact');
  const [textAnimation, setTextAnimation] = useState('none');
  const [showGrid] = useState(false);
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const [emojiPosition, setEmojiPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [isPlacingEmoji, setIsPlacingEmoji] = useState(false);

  const { signMessage } = useWallet();
  const { wallet: userWallet } = useAuth();

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = defaultImage;
    img.onload = () => setImage(img);
  }, [defaultImage]);

  // Canvas state snapshot for undo/redo
  const saveCanvasState = () => {
    if (!canvasRef.current) return;
    const state = canvasRef.current.toDataURL();
    setUndoStack((prev) => [...prev, state]);
    setRedoStack([]);
  };

  const undo = () => {
    if (undoStack.length === 0) return;
    const state = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));
    setRedoStack((prev) => [...prev, state]);
    loadCanvasState(state);
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const state = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));
    setUndoStack((prev) => [...prev, state]);
    loadCanvasState(state);
  };

  const loadCanvasState = (state: string) => {
    if (!canvasRef.current) return;
    const img = new Image();
    img.src = state;
    img.onload = () => {
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.drawImage(img, 0, 0);
    };
  };

  // Enhanced canvas rendering with new features
  useEffect(() => {
    if (!canvasRef.current || !image) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Setup canvas with 16:9 aspect ratio
    const maxWidth = 1600;
    const maxHeight = 900;

    // Calculate dimensions maintaining aspect ratio
    let canvasWidth = maxWidth;
    const canvasHeight = maxHeight;

    // Ensure aspect ratio is between 2:1 and 1:1
    const aspectRatio = canvasWidth / canvasHeight;
    if (aspectRatio > 2) {
      canvasWidth = canvasHeight * 2; // 2:1 max
    } else if (aspectRatio < 1) {
      canvasWidth = canvasHeight; // 1:1 min
    }

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw background
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw image
    const imageAspectRatio = image.width / image.height;
    let imageWidth = canvasWidth;
    let imageHeight = canvasWidth / imageAspectRatio;

    if (imageHeight > canvasHeight) {
      imageHeight = canvasHeight;
      imageWidth = canvasHeight * imageAspectRatio;
    }

    const offsetX = (canvasWidth - imageWidth) / 2;
    const offsetY = (canvasHeight - imageHeight) / 2;

    // Apply selected filter with enhanced quality
    if (selectedFilter !== 'none') {
      const filterObj =
        SQUID_ELEMENTS.filters[
          selectedFilter as keyof typeof SQUID_ELEMENTS.filters
        ];
      if (filterObj) {
        ctx.filter = filterObj.filter;

        // Apply filter in multiple passes for stronger effect
        ctx.drawImage(image, offsetX, offsetY, imageWidth, imageHeight);

        // Optional: Add subtle vignette effect for drama
        if (['redLight', 'nightmare', 'elimination'].includes(selectedFilter)) {
          const gradient = ctx.createRadialGradient(
            canvasWidth / 2,
            canvasHeight / 2,
            0,
            canvasWidth / 2,
            canvasHeight / 2,
            canvasWidth * 0.8
          );
          gradient.addColorStop(0, 'rgba(0,0,0,0)');
          gradient.addColorStop(1, 'rgba(0,0,0,0.4)');

          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        }
      }
    } else {
      ctx.filter = 'none';
      ctx.drawImage(image, offsetX, offsetY, imageWidth, imageHeight);
    }

    // Reset filter
    ctx.filter = 'none';

    // Setup text properties
    ctx.textAlign = 'center';
    ctx.fillStyle = textColor;
    ctx.strokeStyle = 'black';
    ctx.lineWidth = fontSize / 6;
    ctx.font = `bold ${fontSize}px ${SQUID_ELEMENTS.fonts[selectedFont as keyof typeof SQUID_ELEMENTS.fonts] || 'Impact'}`;

    // Draw text
    if (topText) {
      ctx.strokeText(topText, canvasWidth / 2, fontSize + 10);
      ctx.fillText(topText, canvasWidth / 2, fontSize + 10);
    }

    if (bottomText) {
      ctx.strokeText(bottomText, canvasWidth / 2, canvasHeight - 20);
      ctx.fillText(bottomText, canvasWidth / 2, canvasHeight - 20);
    }

    // Draw emoji if selected
    if (selectedEmoji && emojiPosition) {
      ctx.font = `${fontSize * 2}px Arial`;
      ctx.fillText(selectedEmoji, emojiPosition.x, emojiPosition.y);
    }

    // Draw grid if enabled
    if (showGrid) {
      ctx.strokeStyle = 'rgba(255, 11, 122, 0.2)';
      ctx.lineWidth = 1;
      const gridSize = 20;

      for (let x = 0; x <= canvasWidth; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasHeight);
        ctx.stroke();
      }

      for (let y = 0; y <= canvasHeight; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    }

    // Add NFun watermark
    const watermarkText = 'NFun.vercel.app';
    // Save the current context state
    ctx.save();

    // Position watermark within the actual image area (accounting for the image position)
    // Calculate the actual right and bottom edges of the image
    const imageRightEdge = offsetX + imageWidth;
    const imageBottomEdge = offsetY + imageHeight;

    // Place watermark inside the image with padding
    const padding = 15;
    const chipX = imageRightEdge - padding - 95; // Center position of chip
    const chipY = imageBottomEdge - padding - 10; // Center position of chip

    // Draw chip background
    const chipWidth = 170;
    const chipHeight = 25;
    const cornerRadius = 12;

    // Draw rounded rectangle for chip background
    ctx.beginPath();
    ctx.moveTo(chipX - chipWidth / 2 + cornerRadius, chipY - chipHeight / 2);
    ctx.lineTo(chipX + chipWidth / 2 - cornerRadius, chipY - chipHeight / 2);
    ctx.arc(
      chipX + chipWidth / 2 - cornerRadius,
      chipY - chipHeight / 2 + cornerRadius,
      cornerRadius,
      -Math.PI / 2,
      0
    );
    ctx.lineTo(chipX + chipWidth / 2, chipY + chipHeight / 2 - cornerRadius);
    ctx.arc(
      chipX + chipWidth / 2 - cornerRadius,
      chipY + chipHeight / 2 - cornerRadius,
      cornerRadius,
      0,
      Math.PI / 2
    );
    ctx.lineTo(chipX - chipWidth / 2 + cornerRadius, chipY + chipHeight / 2);
    ctx.arc(
      chipX - chipWidth / 2 + cornerRadius,
      chipY + chipHeight / 2 - cornerRadius,
      cornerRadius,
      Math.PI / 2,
      Math.PI
    );
    ctx.lineTo(chipX - chipWidth / 2, chipY - chipHeight / 2 + cornerRadius);
    ctx.arc(
      chipX - chipWidth / 2 + cornerRadius,
      chipY - chipHeight / 2 + cornerRadius,
      cornerRadius,
      Math.PI,
      (3 * Math.PI) / 2
    );
    ctx.closePath();

    // Fill and stroke
    ctx.fillStyle = 'rgba(10, 10, 10, 0.8)'; // Dark background
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 11, 122, 0.9)'; // Brand color pink
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Set text style
    ctx.font = 'bold 15px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'; // White text

    // Add small square icon before text (like a logo)
    const iconSize = 5;
    const iconPadding = 78;
    ctx.fillStyle = 'rgba(255, 11, 122, 1)'; // Solid pink for icon
    ctx.fillRect(chipX - iconPadding, chipY - iconSize / 2, iconSize, iconSize);

    // Draw text
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'; // White text
    ctx.fillText(watermarkText, chipX, chipY);

    // Restore the context state
    ctx.restore();

    // Save state for undo/redo
    saveCanvasState();
  }, [
    image,
    topText,
    bottomText,
    fontSize,
    textColor,
    selectedEmoji,
    selectedFilter,
    selectedFont,
    showGrid,
    emojiPosition,
  ]);

  const handleSave = async () => {
    setIsSaving(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const imageDataUrl = canvas.toDataURL('image/png');

    try {
      // const popup = window.open(
      //   'https://w3s.link/ipfs/bafybeibvvxqef5arqj4uy22zwl3hcyvrthyfrjzoeuzyfcbizjur4yt6by/?action=sign&message=hello',
      //   'WalletAction',
      //   'width=600,height=400'
      // );

      // if (!popup) {
      //   throw new Error('Popup blocked. Please allow popups and try again.');
      // }

      // const handleMessage = async (event: MessageEvent) => {
      //   if (event.data?.type === 'SIGNATURE_CREATED') {
      //     window.removeEventListener('message', handleMessage); // Clean up listener

      //     try {
      //       const storedPublicKey = localStorage.getItem('PUBLIC_KEY');
      //       if (!storedPublicKey) {
      //         throw new Error('Public key not found');
      //       }

      //       const smartWalletPubkey = await getSmartWalletPdaByCreator(
      //         connection,
      //         Array.from(Buffer.from(storedPublicKey, 'base64'))
      //       );
      //       const instruction = new TransactionInstruction({
      //         keys: [
      //           {
      //             pubkey: new PublicKey(smartWalletPubkey),
      //             isSigner: true,
      //             isWritable: true,
      //           },
      //           // Add other accounts your instruction needs
      //         ],
      //         programId: new PublicKey(
      //           'BqbCmDr1KEwPhEt2UtbRiWYrKmUdTaoFKFnn6XRKKMQE'
      //         ), // Memo program ID
      //         data: Buffer.from(`NFun Meme Created: ${'test-id'}`, 'utf-8'),
      //       });

      //       const { normalized, msg } = event.data.data;

      //       const txn = await createVerifyAndExecuteTransaction({
      //         arbitraryInstruction: instruction, // Make sure 'instruction' is defined
      //         pubkey: Buffer.from(storedPublicKey, 'base64'),
      //         signature: Buffer.from(normalized, 'base64'),
      //         message: Buffer.from(msg, 'base64'),
      //         connection,
      //         payer: keypair.publicKey,
      //         smartWalletPda: new PublicKey(smartWalletPubkey), // Ensure PublicKey is correctly imported
      //       });

      //       txn.partialSign(keypair);
      //       const txid = await connection.sendRawTransaction(txn.serialize(), {
      //         skipPreflight: true,
      //       });

      //       console.log('Transaction ID:', txid);
      //     } catch (err) {
      //       console.error('Error signing message:', err);
      //     }
      //   }
      // };

      // window.addEventListener('message', handleMessage);

      const response = await axios.post('/api/memes', {
        imageDataUrl,
        userWallet,
        originalImage: defaultImage,
      });
      console.log('Image saved in DB:', response.data);
      
      // Get the meme ID from the response
      const memeId = response.data.id;

      // Create and sign the transaction
      const instruction = new TransactionInstruction({
        keys: [
          {
            // @ts-expect-error ignore
            pubkey: new PublicKey(userWallet),
            isSigner: true,
            isWritable: true,
          },
        ],
        programId: new PublicKey(
          'BqbCmDr1KEwPhEt2UtbRiWYrKmUdTaoFKFnn6XRKKMQE'
        ), // Memo program ID
        data: Buffer.from(`NFun Meme Created: ${memeId}`, 'utf-8'),
      });
      
      // Sign the message and get transaction ID
      const transactionResult = await signMessage(instruction);
      console.log('Transaction ID:', transactionResult);
      
      // If we got a transaction hash, update the meme record
      if (transactionResult) {
        const updateResponse = await axios.put('/api/memes', {
          userWallet,
          memeId,
          txnHash: transactionResult
        });
        
        console.log('Meme updated with transaction hash:', updateResponse.data);
        toast.success('Meme saved and minted successfully!');
      } else {
        // If transaction was successful but we didn't get a hash
        toast('Your meme has been saved to the gallery.');
      }
      
    } catch (error) {
      toast.error('Failed to save meme. Please try again.');
      console.error('Error during image upload or transaction:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Generate AI caption
  const generateSquidCaption = () => {
    const randomCaption =
      SQUID_ELEMENTS.captions[
        Math.floor(Math.random() * SQUID_ELEMENTS.captions.length)
      ];
    setTopText(randomCaption);
    toast.success('Generated Squid Game caption!');
  };

  // Share to Twitter with Squid Game hashtags
  const shareToTwitter = async () => {
    if (!canvasRef.current) return;

    const caption = encodeURIComponent(
      `I've just created this cool Meme on @nftoodlehq🦑\n\nCreate your own at https://NFun.vercel.app`
    );

    const imageUrl = canvasRef.current.toDataURL('image/png');
    window.open(
      `https://twitter.com/intent/tweet?text=${caption}&url=${imageUrl}`
    );
  };

  // Add this function to handle canvas clicks for emoji placement
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isPlacingEmoji || !selectedEmoji) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;

    setEmojiPosition({ x, y });
    setIsPlacingEmoji(false);
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={squidGameVariants}
      className="min-h-screen p-4 lg:p-8"
    >
      <div className="max-w-7xl mx-auto">
        {/* Main Content Area */}
        <div className="grid lg:grid-cols-[1fr,400px] gap-8">
          {/* Canvas Section */}
          <motion.div variants={cardVariants} className="order-2 lg:order-1">
            <div className="sticky top-4">
              <div className="squid-card p-6">
                {/* Canvas Container */}
                <div className="relative w-full aspect-[16/9] max-w-[1600px] mx-auto">
                  <div className="absolute top-4 right-4 flex gap-2 z-10">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={undo}
                      disabled={undoStack.length === 0}
                      className="squid-button-icon group"
                      title="Undo"
                    >
                      <span className="sr-only">Undo</span>↩
                      <span className="squid-tooltip">Undo</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={redo}
                      disabled={redoStack.length === 0}
                      className="squid-button-icon group"
                      title="Redo"
                    >
                      <span className="sr-only">Redo</span>↪
                      <span className="squid-tooltip">Redo</span>
                    </motion.button>
                  </div>
                  <canvas
                    ref={canvasRef}
                    onClick={handleCanvasClick}
                    className={`w-full h-full object-contain rounded-lg shadow-xl ${isPlacingEmoji ? 'cursor-crosshair' : 'cursor-default'}`}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center gap-4 mt-6">
                  <motion.button
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="squid-button px-8 py-3"
                  >
                    {isSaving ? (
                      <span className="flex items-center gap-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1 }}
                        >
                          ⭕
                        </motion.div>
                        Saving...
                      </span>
                    ) : (
                      'Save Meme'
                    )}
                  </motion.button>

                  <motion.button
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    onClick={shareToTwitter}
                    className="squid-button-outline px-8 py-3"
                  >
                    Share on Twitter
                  </motion.button>

                  <motion.button
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    onClick={() => {
                      const canvas = canvasRef.current;
                      if (!canvas) return;
                      const link = document.createElement('a');
                      link.download = 'squid-game-meme.png';
                      link.href = canvas.toDataURL('image/png');
                      link.click();
                    }}
                    className="squid-button-outline px-8 py-3"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Controls Section */}
          <motion.div variants={cardVariants} className="order-1 lg:order-2">
            <div className="sticky top-4">
              <div className="squid-card">
                <Tabs defaultValue="text" className="h-full">
                  <TabsList className="grid grid-cols-4 p-2 gap-2 bg-gray-900/50">
                    {[
                      { id: 'text', icon: Type, label: 'Text' },
                      { id: 'stickers', icon: Sticker, label: 'Stickers' },
                      { id: 'effects', icon: Wand2, label: 'Effects' },
                      { id: 'tools', icon: Crown, label: 'Tools' },
                    ].map(({ id, icon: Icon, label }) => (
                      <TabsTrigger
                        key={id}
                        value={id}
                        className="squid-tab squid-tab-wrapper"
                      >
                        <Icon className="w-5 h-5" />
                        <span className="squid-tooltip">{label}</span>
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {/* Text Tab */}
                  <TabsContent value="text" className="p-6 space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Top Text</Label>
                        <Input
                          type="text"
                          value={topText}
                          onChange={(e) => setTopText(e.target.value)}
                          className="squid-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Bottom Text</Label>
                        <Input
                          type="text"
                          value={bottomText}
                          onChange={(e) => setBottomText(e.target.value)}
                          className="squid-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Font Size: {fontSize}px</Label>
                        <Slider
                          value={[fontSize]}
                          onValueChange={([value]) => setFontSize(value)}
                          min={50}
                          max={150}
                          step={1}
                          className="py-2"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Text Color</Label>
                        <Input
                          type="color"
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          className="squid-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Text Effect</Label>
                        <Select
                          value={textEffect}
                          onValueChange={setTextEffect}
                        >
                          <SelectTrigger className="squid-input">
                            <SelectValue placeholder="Select effect" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="shadow">Shadow</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Text Animation</Label>
                        <Select
                          value={textAnimation}
                          onValueChange={setTextAnimation}
                        >
                          <SelectTrigger className="squid-input">
                            <SelectValue placeholder="Choose animation" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="glow">Neon Glow</SelectItem>
                            <SelectItem value="shake">Shake</SelectItem>
                            <SelectItem value="rainbow">Rainbow</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Stickers Tab */}
                  <TabsContent value="stickers" className="p-6">
                    <div className="grid grid-cols-3 gap-3">
                      {Object.entries(SQUID_ELEMENTS.emojis).map(
                        ([key, emoji]) => (
                          <button
                            key={key}
                            onClick={() => {
                              setSelectedEmoji(emoji);
                              setIsPlacingEmoji(true);
                              toast.info(
                                'Click on the canvas to place the emoji'
                              );
                            }}
                            className={`squid-button text-2xl aspect-square ${isPlacingEmoji && selectedEmoji === emoji ? 'ring-2 ring-[#FF0B7A]' : ''}`}
                          >
                            {emoji}
                          </button>
                        )
                      )}
                    </div>
                  </TabsContent>

                  {/* Effects Tab */}
                  <TabsContent value="effects" className="p-6 space-y-6">
                    <div className="space-y-2">
                      <Label>Filter Effect</Label>
                      <Select
                        value={selectedFilter}
                        onValueChange={setSelectedFilter}
                      >
                        <SelectTrigger className="squid-input">
                          <SelectValue placeholder="Choose filter" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {Object.entries(SQUID_ELEMENTS.filters).map(
                            ([key, { name }]) => (
                              <SelectItem key={key} value={key}>
                                {name}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </TabsContent>

                  {/* Tools Tab */}
                  <TabsContent value="tools" className="p-6 space-y-6">
                    <div className="space-y-4">
                      <div className="squid-control-group">
                        <Label>Font Style</Label>
                        <Select
                          value={selectedFont}
                          onValueChange={setSelectedFont}
                        >
                          <SelectTrigger className="squid-input">
                            <SelectValue placeholder="Choose font" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(SQUID_ELEMENTS.fonts).map(
                              ([key, name]) => (
                                <SelectItem key={key} value={key}>
                                  {name}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <button
                        onClick={generateSquidCaption}
                        className="squid-button w-full"
                      >
                        Generate Squid Game Caption
                      </button>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
