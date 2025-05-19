import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest, { params }: { params: { memeId: string } }) {
  try {
    const memeId = parseInt(params.memeId, 10);

    if (isNaN(memeId)) {
      return NextResponse.json({ error: 'Invalid meme ID' }, { status: 400 });
    }

    const updatedMeme = await prisma.meme.update({
      where: { id: memeId },
      data: {
        votes: {
          increment: 1,
        },
      },
    });

    if (!updatedMeme) {
      return NextResponse.json({ error: 'Meme not found or could not be updated' }, { status: 404 });
    }

    return NextResponse.json(updatedMeme, { status: 200 });
  } catch (error) {
    console.error('Error updating meme vote:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 