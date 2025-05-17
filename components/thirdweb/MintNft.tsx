'use client';

import { useState, useEffect } from 'react';
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import axios from 'axios';
import { motion } from 'framer-motion';
import { buttonVariants } from '@/styles/animations';
import { uploadToArweave, mintExistingNft } from '@/lib/mint';
import usePrivyWallet from '@/lib/hooks/usePrivyWallet';
import { toast } from 'sonner';

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
    if (image) {
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
    } else {
      setIsLoading(false);
    }
  }, [image]);

  useEffect(() => {
    if (!name || !description || !image) {
      setError('Missing required NFT metadata');
    }
  }, [name, description, image]);

  async function mint() {
    console.log(process.env.ARWEAVE_WALLET_KEYFILE);

    if (!walletAddress) {
      setError('Please connect your wallet first');
      return;
    }

    try {
      setError(null);
      setSuccess(false);

      // Generate a shorter display name for the NFT
      const displayName = `NFToodle #${memeId}`;
      console.log(`Using display name for NFT: ${displayName}`);

      // First, check if this meme already has a transaction hash in the database
      console.log('Checking for existing txnHash...');
      const checkResponse = await axios.get(`/api/memes?memeId=${memeId}`);
      console.log('checkResponse', checkResponse.data);

      let metadataUri;

      if (checkResponse.data.hasTxnHash && checkResponse.data.txnHash) {
        console.log('Found existing txnHash 😄, skipping Arweave upload');
        metadataUri = checkResponse.data.txnHash;
      } else {
        console.log('No existing txnHash found, uploading to Arweave...');
        const { finalTxnDetails, metadataUri: newUri } = await uploadToArweave(
          image,
          displayName,
          description
        );

        metadataUri = newUri;
        console.log('finalTxnDetails', finalTxnDetails);
        console.log('metadataUri', metadataUri);
        console.log(
          'successfully uploaded to arweave, now updating database...'
        );

        // Update txnHash in DB
        const updateResponse = await axios.put('/api/memes', {
          userWallet: walletAddress,
          memeId: memeId,
          txnHash: metadataUri,
        });

        if (!updateResponse.data) {
          throw new Error('Failed to update mint status in DB');
        }
      }

      console.log('Starting NFT mint with URI:', metadataUri);

      const mintResponse = await mintExistingNft(metadataUri, displayName);
      console.log('Mint successful:\n', mintResponse);

      if (mintResponse && mintResponse.nft) {
        // Update mint status and store NFT details in DB
        console.log('Updating mint status and NFT details in DB...');

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
        if (token && token.token) {
          nftDetails.tokenAddress = token.token.address.toString();
          nftDetails.ownerAddress = token.token.ownerAddress.toString();
        }

        const updateMintStatusResponse = await axios.put(
          '/api/memes/mint-status',
          {
            userWallet: walletAddress,
            memeId: memeId,
            mintStatus: true,
            nftDetails,
          }
        );

        console.log('DB update response:', updateMintStatusResponse.data);

        if (!updateMintStatusResponse.data) {
          console.warn(
            'Failed to update mint status in DB, but NFT was minted successfully'
          );
        }
      }

      setSuccess(true);
      setShowTooltip(true);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes('User rejected the request')
      ) {
        setError('User rejected the request');
        toast.error('User rejected the request');
        return;
      } else {
        console.error('Failed to mint NFT\n', error);
        toast.error('Failed to mint NFT');
        setError(`Failed to mint NFT`);
      }
    }
  }

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
    if (success) {
      toast.success('NFT minted successfully');
    }
  }, [error, success]);

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="bg-gray-200 rounded-lg h-64" />
        <div className="bg-gray-200 rounded h-10" />
      </div>
    );
  }

  // const isButtonDisabled = minted || isMinting || !!error;

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
                    // disabled={isButtonDisabled}
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
