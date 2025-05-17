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
import usePrivyWallet from '@/hooks/usePrivyWallet';
import { buttonVariants } from '@/styles/animations';
import { uploadToArweave, mintExistingNft } from '@/lib/mint';

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
  description,
  image,
  minted,
  memeId,
  isCurrentMinting,
}: MintNftData) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const { address: walletAddress } = usePrivyWallet();

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

      // Generate display name for NFT
      const displayName = `NFToodle #${memeId}`;
      console.log(`Using display name for NFT: ${displayName}`);

      // Check for existing transaction hash
      const { exists, uri } = await checkExistingTxnHash();
      let metadataUri = uri;

      // If no existing transaction hash, upload to Arweave
      if (!exists) {
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
      console.log('Starting NFT mint with URI:', metadataUri);
      const mintResponse = await mintExistingNft(metadataUri, displayName);

      if (!mintResponse.status) {
        throw new Error('Failed to mint NFT');
      }

      // Store NFT details if mint was successful
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
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('User rejected the request')) {
          setError('User rejected the request');
          toast.error('User rejected the request');
        } else {
          console.error('Failed to mint NFT:', error);
          setError('Failed to mint NFT');
          toast.error('Failed to mint NFT');
        }
      }
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
    <div>
      {imageLoaded && (
        <TooltipProvider delayDuration={0}>
          <Tooltip open={success && showTooltip}>
            <TooltipTrigger asChild>
              <div className="w-full font-squid">
                {minted ? (
                  <motion.button
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    className="w-full px-4 py-2 rounded-lg font-bold text-white bg-green-600/20 border-2 border-green-500 backdrop-blur-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled
                  >
                    Already Minted
                  </motion.button>
                ) : (
                  <motion.button
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    className={`w-full px-4 py-2 rounded-lg font-bold text-white squid-button transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                      isCurrentMinting ? 'animate-pulse' : ''
                    }`}
                    onClick={mint}
                  >
                    {isCurrentMinting ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Minting...
                      </span>
                    ) : (
                      'Mint NFT'
                    )}
                  </motion.button>
                )}
              </div>
            </TooltipTrigger>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}
