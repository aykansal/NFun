'use client';

import axios from 'axios';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { squidGameVariants } from '@/lib/data';
import { SQUID_ELEMENTS } from '@/lib/constant';
import { useAuth } from '@/context/AuthContext';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useRef, useState, useEffect, Suspense } from 'react';
import type { MemeGeneratorProps } from '@/lib/types';
import { buttonVariants, cardVariants } from '@/styles/animations';
import { Type, Wand2, Sticker, Crown } from 'lucide-react';
import { Tabs, TabsList, TabsContent, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SquidCard } from '@/components/ui/squid-card';

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
  const [activeTab, setActiveTab] = useState<string>('text');

  const { wallet: walletAddress } = useAuth();

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
      const response = await axios.post('/api/memes', {
        imageDataUrl,
        userWallet: walletAddress,
        originalImage: defaultImage,
      });
      const memeId = response.data.id;
      if (memeId) {
        toast.success('Meme saved successfully!');
      } else {
        throw new Error('Failed to save meme. Please try again!');
      }

      toast.success('Meme saved successfully!');
    } catch (error) {
      toast.error('Failed to save meme. Please try again!');
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
      className="min-h-screen p-2 xs:p-3 sm:p-4 lg:p-8"
    >
      <div className="max-w-7xl mx-auto">
        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,400px] gap-4 xs:gap-6 md:gap-8">
          {/* Canvas Section */}
          <Suspense fallback={<h1>Loading Preview...</h1>}>
            <motion.div variants={cardVariants} className="order-1">
              <div className="sticky top-4">
                <SquidCard padding="sm">
                  {/* Canvas Container */}
                  <div className="relative w-full aspect-[16/9] max-w-[1600px] mx-auto">
                    <div className="absolute top-2 xs:top-4 right-2 xs:right-4 flex gap-1 xs:gap-2 z-10">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={undo}
                        disabled={undoStack.length === 0}
                        className="squid-button-icon group text-xs xs:text-sm"
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
                        className="squid-button-icon group text-xs xs:text-sm"
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
                  <div className="flex flex-wrap justify-center gap-3 xs:gap-4 mt-4 xs:mt-5 sm:mt-6">
                    <motion.button
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                      onClick={handleSave}
                      disabled={isSaving}
                      className="squid-button min-w-[120px] xs:min-w-[140px] flex-1 px-4 xs:px-6 sm:px-8 py-2.5 xs:py-3 text-xs xs:text-sm sm:text-base font-ibm font-medium shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isSaving ? (
                        <span className="flex items-center justify-center gap-2">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1 }}
                            className="w-4 h-4 flex items-center justify-center"
                          >
                            ⭕
                          </motion.div>
                          <span>Saving...</span>
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          Save Meme
                        </span>
                      )}
                    </motion.button>

                    <motion.button
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                      onClick={shareToTwitter}
                      className="squid-button-outline flex-1 min-w-[120px] xs:min-w-[140px] px-4 xs:px-6 sm:px-8 py-2.5 xs:py-3 text-xs xs:text-sm sm:text-base font-ibm font-medium shadow-md hover:shadow-lg transition-shadow"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <span className="inline">Post</span>
                        <span className="inline">On</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-3.5 h-3.5 xs:w-4 xs:h-4 mr-1.5 xs:mr-2"
                        >
                          <path d="M13.6823 10.6218L20.2391 3H18.6854L12.9921 9.61788L8.44486 3H3.2002L10.0765 13.0074L3.2002 21H4.75404L10.7663 14.0113L15.5549 21H20.7996L13.6819 10.6218H13.6823ZM11.5541 13.0956L10.8574 12.0991L5.31391 4.16971H7.70053L12.1742 10.5689L12.8709 11.5655L18.6861 19.8835H16.2995L11.5541 13.096V13.0956Z" />
                        </svg>
                      </span>
                    </motion.button>
                  </div>
                </SquidCard>
              </div>
            </motion.div>
          </Suspense>

          {/* Controls Section */}
          <Suspense fallback={<h1>Loading Editor...</h1>}>
            <motion.div variants={cardVariants} className="order-2">
              <div className="sticky top-4">
                <SquidCard padding="none">
                  {/* Mobile Dropdown for Edit Options (visible only on small screens) */}
                  <div className="block lg:hidden p-3 xs:p-4">
                    <Label className="block mb-2 text-xs xs:text-sm">
                      Edit Options
                    </Label>
                    <Select
                      value={activeTab}
                      onValueChange={(value) => {
                        setActiveTab(value);
                        console.log('Tab changed to:', value);
                      }}
                    >
                      <SelectTrigger className="squid-input text-xs xs:text-sm">
                        <SelectValue placeholder="Select edit option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="stickers">Stickers</SelectItem>
                        <SelectItem value="effects">Effects</SelectItem>
                        <SelectItem value="tools">Tools</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="h-full"
                  >
                    <TabsList className="hidden lg:grid grid-cols-4 p-2 gap-2 bg-gray">
                      {[
                        { id: 'text', icon: Type, label: 'Text' },
                        { id: 'stickers', icon: Sticker, label: 'Stickers' },
                        { id: 'effects', icon: Wand2, label: 'Effects' },
                        { id: 'tools', icon: Crown, label: 'Tools' },
                      ].map(({ id, icon: Icon, label }) => (
                        <TabsTrigger
                          key={id}
                          value={id}
                          className="relative flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-300 hover:bg-[#FF0B7A]/20 data-[state=active]:bg-[#FF0B7A] data-[state=active]:text-white"
                        >
                          <Icon className="w-5 h-5" />
                          <span className="squid-tooltip">{label}</span>
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {/* Text Tab */}
                    <TabsContent
                      value="text"
                      className="p-3 xs:p-4 sm:p-6 space-y-3 xs:space-y-4 sm:space-y-6"
                    >
                      <div className="space-y-2 xs:space-y-3 sm:space-y-4">
                        <div className="space-y-1 xs:space-y-2">
                          <Label className="text-xs xs:text-sm">Top Text</Label>
                          <Input
                            type="text"
                            value={topText}
                            onChange={(e) => setTopText(e.target.value)}
                            className="squid-input text-xs xs:text-sm"
                          />
                        </div>
                        <div className="space-y-1 xs:space-y-2">
                          <Label className="text-xs xs:text-sm">
                            Bottom Text
                          </Label>
                          <Input
                            type="text"
                            value={bottomText}
                            onChange={(e) => setBottomText(e.target.value)}
                            className="squid-input text-xs xs:text-sm"
                          />
                        </div>
                        <div className="space-y-1 xs:space-y-2">
                          <Label className="text-xs xs:text-sm">
                            Font Size: {fontSize}px
                          </Label>
                          <Slider
                            value={[fontSize]}
                            onValueChange={([value]) => setFontSize(value)}
                            min={50}
                            max={150}
                            step={1}
                            className="py-2"
                          />
                        </div>
                        <div className="space-y-1 xs:space-y-2">
                          <Label className="text-xs xs:text-sm">
                            Text Color
                          </Label>
                          <Input
                            type="color"
                            value={textColor}
                            onChange={(e) => setTextColor(e.target.value)}
                            className="squid-input h-8 xs:h-10"
                          />
                        </div>
                        <div className="space-y-1 xs:space-y-2">
                          <Label className="text-xs xs:text-sm">
                            Text Effect
                          </Label>
                          <Select
                            value={textEffect}
                            onValueChange={setTextEffect}
                          >
                            <SelectTrigger className="squid-input text-xs xs:text-sm">
                              <SelectValue placeholder="Select effect" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              <SelectItem value="shadow">Shadow</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1 xs:space-y-2">
                          <Label className="text-xs xs:text-sm">
                            Text Animation
                          </Label>
                          <Select
                            value={textAnimation}
                            onValueChange={setTextAnimation}
                          >
                            <SelectTrigger className="squid-input text-xs xs:text-sm">
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
                    <TabsContent value="stickers" className="p-3 xs:p-4 sm:p-6">
                      <div className="grid grid-cols-3 gap-2 xs:gap-3">
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
                              className={`squid-button text-lg xs:text-xl sm:text-2xl aspect-square ${isPlacingEmoji && selectedEmoji === emoji ? 'ring-2 ring-[#FF0B7A]' : ''}`}
                            >
                              {emoji}
                            </button>
                          )
                        )}
                      </div>
                    </TabsContent>

                    {/* Effects Tab */}
                    <TabsContent
                      value="effects"
                      className="p-3 xs:p-4 sm:p-6 space-y-3 xs:space-y-4 sm:space-y-6"
                    >
                      <div className="space-y-1 xs:space-y-2">
                        <Label className="text-xs xs:text-sm">
                          Filter Effect
                        </Label>
                        <Select
                          value={selectedFilter}
                          onValueChange={setSelectedFilter}
                        >
                          <SelectTrigger className="squid-input text-xs xs:text-sm">
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
                    <TabsContent
                      value="tools"
                      className="p-3 xs:p-4 sm:p-6 space-y-3 xs:space-y-4 sm:space-y-6"
                    >
                      <div className="space-y-2 xs:space-y-3 sm:space-y-4">
                        <div className="squid-control-group p-2 xs:p-3 sm:p-4">
                          <Label className="text-xs xs:text-sm">
                            Font Style
                          </Label>
                          <Select
                            value={selectedFont}
                            onValueChange={setSelectedFont}
                          >
                            <SelectTrigger className="squid-input text-xs xs:text-sm">
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
                          className="squid-button w-full text-xs xs:text-sm py-2 xs:py-3"
                        >
                          Generate Squid Game Caption
                        </button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </SquidCard>
              </div>
            </motion.div>
          </Suspense>
        </div>
      </div>
    </motion.div>
  );
}
