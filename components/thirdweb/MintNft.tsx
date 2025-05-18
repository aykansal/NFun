'use client';

import { useState, useEffect } from 'react';
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import axios from 'axios';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { buttonVariants } from '@/styles/animations';
import { uploadToArweave, mintExistingNft } from '@/lib/mint';
import { useAuth } from '@/context/AuthContext';
import { useMinting } from '@/context/MintingContext';

interface NftDetails {
  nftAddress: string;
  mintAddress: string;
  name: string;
  uri: string;
  transactionSignature: string;
  tokenAddress?: string;
  ownerAddress?: string;
}

interface MintNftData {
  name: string;
  description: string;
  image: string;
  minted: boolean;
  memeId: number;
  isCurrentMinting: boolean;
}

export default function MintNft({
  name,
  image,
  minted,
  memeId,
  description,
  isCurrentMinting,
}: MintNftData) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);

  const { wallet: walletAddress } = useAuth();
  const { startMinting, updateMintingStep, finishMinting } = useMinting();

  useEffect(() => {
    if (!image) {
      setIsLoading(false);
      return;
    }

    const img = new Image();
    img.src = image;
    img.onload = () => {
      setImageLoaded(true);
      setIsLoading(false);
    };
    img.onerror = () => {
      setError('Failed to load NFT image');
      setIsLoading(false);
    };
  }, [image]);

  useEffect(() => {
    if (!name || !description || !image) {
      setError('Missing required NFT metadata');
    }
  }, [name, description, image]);

  useEffect(() => {
    if (error) toast.error(error);
    if (success) toast.success('NFT minted successfully');
  }, [error, success]);

  const checkExistingTxnHash = async () => {
    try {
      const response = await axios.get(`/api/memes?memeId=${memeId}`);
      return {
        exists: response.data.hasTxnHash && response.data.txnHash,
        uri: response.data.txnHash,
      };
    } catch (err) {
      console.error('Error checking existing transaction:', err);
      return { exists: false, uri: null };
    }
  };

  const updateTxnHashInDb = async (metadataUri: string) => {
    try {
      const response = await axios.put('/api/memes', {
        userWallet: walletAddress,
        memeId: memeId,
        txnHash: metadataUri,
      });
      return !!response.data;
    } catch (err) {
      console.error('Error updating transaction hash:', err);
      return false;
    }
  };

  const updateMintStatus = async (nftDetails: NftDetails) => {
    try {
      const response = await axios.put('/api/memes/mint-status', {
        userWallet: walletAddress,
        memeId: memeId,
        mintStatus: true,
        nftDetails,
      });
      return !!response.data;
    } catch (err) {
      console.error('Error updating mint status:', err);
      return false;
    }
  };

  // Handle the mint process
  const mint = async () => {
    if (!walletAddress) {
      setError('Please connect your wallet first');
      return;
    }

    try {
      setError(null);
      setSuccess(false);
      
      // Start the minting process and show the overlay
      startMinting(memeId);

      // Generate display name for NFT
      const displayName = `NFToodle #${memeId}`;
      console.log(`Using display name for NFT: ${displayName}`);

      // Check for existing transaction hash
      const { exists, uri } = await checkExistingTxnHash();
      let metadataUri = uri;

      // If no existing transaction hash, upload to Arweave
      if (!exists) {
        updateMintingStep('uploading');
        console.log('No existing txnHash found, uploading to Arweave...');
        const {
          metadataUri: newUri,
          status,
          error,
        } = await uploadToArweave(
          image,
          displayName,
          description,
          walletAddress
        );

        if (!status) throw new Error(error || 'Failed to upload to Arweave');

        metadataUri = newUri;
        const updated = await updateTxnHashInDb(metadataUri);
        if (!updated)
          console.warn('Warning: Failed to update txnHash in database');
      }

      // Mint the NFT
      updateMintingStep('minting');
      console.log('Starting NFT mint with URI:', metadataUri);
      const mintResponse = await mintExistingNft(metadataUri, displayName);

      if (!mintResponse.status) {
        throw new Error('Failed to mint NFT');
      }

      // Store NFT details if mint was successful
      updateMintingStep('confirming');
      if (mintResponse.nft) {
        const nftDetails: NftDetails = {
          nftAddress: mintResponse.nft.address.toString(),
          mintAddress: mintResponse.nft.mint?.address.toString() || '',
          name: mintResponse.nft.name,
          uri: mintResponse.nft.uri,
          transactionSignature: mintResponse.response.signature,
        };

        // Add owner and token info if available
        const token = mintResponse.nft as unknown as {
          token: { address: string; ownerAddress: string };
        };

        if (token?.token) {
          nftDetails.tokenAddress = token.token.address.toString();
          nftDetails.ownerAddress = token.token.ownerAddress.toString();
        }

        const updated = await updateMintStatus(nftDetails);
        if (!updated) {
          console.warn(
            'Warning: Failed to update mint status in DB, but NFT was minted successfully'
          );
        }
      }

      setSuccess(true);
      setShowTooltip(true);
      
      // End the minting process and hide the overlay
      finishMinting();
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('User rejected the request')) {
          setError('User rejected the request');
        } else {
          console.error({
            error: error.message,
            stack: error.stack?.split('\n'),
          });
          setError('Failed to mint NFT');
        }
      } else {
        setError('Failed to mint NFT !!');
      }
      
      // End the minting process and hide the overlay
      finishMinting();
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="bg-gray-200 rounded-lg h-64" />
        <div className="bg-gray-200 rounded h-10" />
      </div>
    );
  }

  return (
    <div className="w-full">
      {imageLoaded && (
        <TooltipProvider delayDuration={0}>
          <Tooltip open={success && showTooltip}>
            <TooltipTrigger asChild>
              {minted ? (
                <motion.button
                  // variants={buttonVariants}
                  className="w-full px-2 py-1.5 xs:px-3 xs:py-2 text-xs xs:text-sm md:text-base rounded-lg font-bold text-white bg-green-500/20 border border-green-400 xs:border-2 backdrop-blur-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 xs:gap-2"
                  disabled
                >
                  <span className="text-green-400">✓</span>
                  <span className="truncate">Minted</span>
                </motion.button>
              ) : (
                <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  className={`flex justify-center items-center gap-1 xs:gap-2 squid-button px-2 py-1.5 xs:px-3 xs:py-2 rounded-lg w-full transform transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed  ${
                    isCurrentMinting ? 'animate-pulse bg-[#FF0B7A]/60' : ''
                  }`}
                  onClick={mint}
                  disabled={isCurrentMinting || minted}
                >
                  {isCurrentMinting ? (
                    <span className="inline">Minting...</span>
                  ) : (
                    <span className="inline">Mint NFT</span>
                  )}
                </motion.button>
              )}
            </TooltipTrigger>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}
