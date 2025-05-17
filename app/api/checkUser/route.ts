import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';

export async function POST(req: NextRequest) {
    try {
        const { userWallet } = await req.json();

        if (!userWallet) {
            return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
        }

        // Try to find the user first
        let user = await prisma.user.findUnique({
            where: {
                userWallet
            },
        });

        let isNewUser = false;

        // If user doesn't exist, try to create them
        if (!user) {
            try {
                // Attempt to create the user
                user = await prisma.user.create({
                    data: {
                        userWallet,
                        username: `${userWallet.substring(0, 4)}...${userWallet.substring(userWallet.length - 4)}`,
                    },
                });
                isNewUser = true;
            } catch (e) {
                // If creation fails due to a unique constraint violation, it means another concurrent
                // request created the user first, so we need to fetch that user
                if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
                    // Get the user that was created in the race condition
                    user = await prisma.user.findUnique({
                        where: { userWallet }
                    });
                    
                    if (!user) {
                        throw new Error('Failed to find user after creation conflict');
                    }
                } else {
                    // If it's any other error, rethrow it
                    throw e;
                }
            }
        }

        return NextResponse.json({
            user,
            isNewUser,
            userExists: true,
        });
    } catch (error) {
        console.error('Error in profile API:', error);
        return NextResponse.json({
            error: 'Server error'
        }, {
            status: 500
        });
    }
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const address = searchParams.get('address');

        if (!address) {
            return NextResponse.json({ error: 'Address is required' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: {
                userWallet: address,
            },
            include: {
                memes: true,
            },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}