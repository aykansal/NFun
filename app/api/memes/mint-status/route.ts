import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: NextRequest) {
  try {
    const { userWallet, memeId, mintStatus, nftDetails } = await req.json();

    // Validate inputs
    if (!userWallet || !memeId || mintStatus === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: userWallet, memeId, or mintStatus' },
        { status: 400 }
      );
    }

    // Check if the meme exists
    const meme = await prisma.meme.findUnique({
      where: {
        id: memeId,
      }
    });

    if (!meme) {
      return NextResponse.json(
        { error: 'Meme not found' },
        { status: 404 }
      );
    }

    // Check if the user owns this meme
    if (meme.userWallet !== userWallet) {
      return NextResponse.json(
        { error: 'Unauthorized: You do not own this meme' },
        { status: 403 }
      );
    }

    // Create NftDetail record and update meme with relation
    let updatedMeme;
    
    if (nftDetails) {
      try {
        // Check if NFT with this address already exists
        const existingNftDetail = await prisma.nftDetail.findUnique({
          where: {
            nftAddress: nftDetails.nftAddress
          }
        });
        
        if (existingNftDetail) {
          // Update meme to reference existing NftDetail
          updatedMeme = await prisma.meme.update({
            where: {
              id: memeId,
            },
            data: {
              minted: mintStatus,
              nftDetailId: existingNftDetail.id
            },
            include: {
              nftDetail: true
            }
          });
        } else {
          // Create NftDetail and update meme in a transaction
          const result = await prisma.$transaction(async (tx) => {
            // Create NFT detail record
            const newNftDetail = await tx.nftDetail.create({
              data: {
                nftAddress: nftDetails.nftAddress,
                mintAddress: nftDetails.mintAddress,
                name: nftDetails.name,
                uri: nftDetails.uri,
                transactionSignature: nftDetails.transactionSignature,
                tokenAddress: nftDetails.tokenAddress,
                ownerAddress: nftDetails.ownerAddress
              },
            });
            
            // Update meme with reference to new NFT detail
            const updatedMeme = await tx.meme.update({
              where: {
                id: memeId,
              },
              data: {
                minted: mintStatus,
                nftDetailId: newNftDetail.id
              },
              include: {
                nftDetail: true
              }
            });
            
            return { updatedMeme, newNftDetail };
          });
          
          updatedMeme = result.updatedMeme;
        }
      } catch (error) {
        console.error('Error creating NFT detail:', error);
        
        // Fallback: update just the minted status if NFT detail creation fails
        updatedMeme = await prisma.meme.update({
          where: {
            id: memeId,
          },
          data: {
            minted: mintStatus
          }
        });
      }
    } else {
      // Update just the minted status if no NFT details provided
      updatedMeme = await prisma.meme.update({
        where: {
          id: memeId,
        },
        data: {
          minted: mintStatus
        }
      });
    }

    return NextResponse.json({
      success: true,
      meme: updatedMeme
    });
  } catch (error) {
    console.error('Error updating mint status:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Internal server error' },
      { status: 500 }
    );
  }
} 