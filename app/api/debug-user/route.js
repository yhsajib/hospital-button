import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function POST(request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { clerkUserId } = await request.json();
    
    // Only allow users to query their own information
    if (userId !== clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const user = await db.user.findUnique({
      where: {
        clerkUserId: clerkUserId
      },
      select: {
        id: true,
        clerkUserId: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Debug user API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}