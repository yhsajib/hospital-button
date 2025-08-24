import { NextResponse } from 'next/server';
import { checkUser } from '@/lib/checkUser';
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

    // Use checkUser which will create the user if they don't exist
    const user = await checkUser();

    if (!user) {
      return NextResponse.json({ error: 'Failed to get or create user' }, { status: 500 });
    }

    // Return only the necessary user data
    const userData = {
      id: user.id,
      clerkUserId: user.clerkUserId,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    return NextResponse.json({ user: userData });
  } catch (error) {
    console.error('Debug user API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}