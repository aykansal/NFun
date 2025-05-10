import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { prisma } from '@/lib/prisma';

/*
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Create Redis client for rate limiting
const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Create rate limiter
const ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 h'), // 5 saves per hour
});
*/

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Helper function: Upload image to Cloudinary
const uploadToCloudinary = async ({
  imageDataUrl,
  accountAddress,
}: {
  imageDataUrl: string;
  accountAddress: string;
}) => {
  try {
    // Validate Base64 image format
    if (!imageDataUrl || !imageDataUrl.startsWith('data:image/png;base64,')) {
      throw new Error('Invalid or empty imageDataUrl');
    }

    const uniquePublicId = `nftoodle_${Date.now()}`;
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          public_id: uniquePublicId,
          folder: 'NFun',
          format: 'png',
          transformation: {
            quality: 'auto',
            fetch_format: 'auto',
          },
          context: { accountAddress },
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      const buffer = Buffer.from(imageDataUrl.split(',')[1], 'base64');
      uploadStream.end(buffer);
    });

    return result as { url: string }; // Adjusted type to ensure compatibility
  } catch (error) {
    console.error('Cloudinary upload failed', error);
    throw new Error('Failed to upload image to Cloudinary');
  }
};

// Helper function: Add meme to the database
// const addMemeToDatabase = async ({
//   cloudinaryUrl,
//   accountAddress,
// }: {
//   cloudinaryUrl: string;
//   accountAddress: string;
// }) => {
//   // Ensure the user exists before linking
//   const user = await prisma.user.upsert({
//     where: { userWallet: accountAddress },
//     create: { userWallet: accountAddress },
//     update: {}, // Do nothing if user exists
//   });

//   const meme = await prisma.meme.create({
//     data: {
//       cloudinaryUrl,
//       userAddress: user.userWallet,
//     },
//   });

//   return meme;
// };

// POST Handler: Upload image and add meme

export async function POST(req: NextRequest) {
  try {
    const { imageDataUrl, userWallet, originalImage } = await req.json();

    // Validate inputs
    if (!imageDataUrl || !userWallet) {
      return NextResponse.json(
        { error: 'Invalid input: imageDataUrl or userWallet missing' },
        { status: 400 }
      );
    }

    // Check rate limit
    // const identifier = userWallet;
    // const { success, reset, remaining } = await ratelimit.limit(identifier);

    // if (!success) {
    //   return NextResponse.json(
    //     {
    //       error: `Rate limit exceeded. Try again in ${Math.ceil((reset - Date.now()) / 100000)} seconds.`,
    //       remaining,
    //       resetIn: reset - Date.now()
    //     },
    //     { status: 429 }
    //   );
    // }

    // const existingMeme = await prisma.meme.findFirst({
    //   where: {
    //     userWallet,
    //     originalImage,
    //     createdAt: {
    //       gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Within last 24 hours
    //     }
    //   }
    // });

    // if (existingMeme) {
    //   return NextResponse.json(
    //     { error: 'You have already created a meme from this image recently' },
    //     { status: 400 }
    //   );
    // }

    const { url: cloudinaryUrl } = await uploadToCloudinary({
      imageDataUrl,
      accountAddress: userWallet,
    });

    const meme = await prisma.meme.create({
      data: {
        cloudinaryUrl,
        userWallet,
        originalImage,
      },
    });

    return NextResponse.json(meme, { status: 201 });
  } catch (error) {
    console.error('Error in POST handler', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET Handler: Fetch memes with pagination
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '9');
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const totalCount = await prisma.meme.count();

    // Fetch memes with pagination
    const memes = await prisma.meme.findMany({
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: true
      }
    });

    return NextResponse.json({
      memes,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        hasMore: skip + limit < totalCount
      }
    });
  } catch (error) {
    console.error('Error fetching memes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch memes' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userWallet, memeId, txnHash } = await req.json();

    // Validate inputs
    if (!userWallet || !memeId || !txnHash) {
      return NextResponse.json(
        { error: 'Missing required fields: userWallet, memeId, or txnHash' },
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

    // Check if the meme is already minted
    if (meme.minted) {
      return NextResponse.json(
        { error: 'Meme has already been minted' },
        { status: 400 }
      );
    }

    // Update the meme with transaction hash
    const updatedMeme = await prisma.meme.update({
      where: {
        id: memeId,
        userWallet: userWallet
      },
      data: {
        minted: true,
        txnhash: txnHash
      }
    });

    return NextResponse.json(updatedMeme);
  } catch (error) {
    console.error('Error updating meme with transaction hash:', error);

    // Handle unique constraint violation for txnhash
    // Use a more specific type for Prisma errors
    interface PrismaError {
      code?: string;
      meta?: {
        target?: string[];
      };
    }

    const prismaError = error as PrismaError;
    if (prismaError.code === 'P2002' && prismaError.meta?.target?.includes('txnhash')) {
      return NextResponse.json(
        { error: 'This transaction hash is already used for another meme' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: (error as Error).message || 'Internal server error' },
      { status: 500 }
    );
  }
}