import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

// GET - Fetch test types
export async function GET(request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: { id: true, role: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const isActive = searchParams.get('isActive');
    const includeInactive = searchParams.get('includeInactive') === 'true';

    let whereClause = {};
    
    if (category) whereClause.category = category;
    if (!includeInactive) whereClause.isActive = true;
    if (isActive !== null) whereClause.isActive = isActive === 'true';

    const testTypes = await db.testType.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        category: true,
        description: true,
        normalRanges: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            testReports: true
          }
        }
      },
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ]
    });

    return NextResponse.json({ testTypes });
  } catch (error) {
    console.error('Test types GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new test type
export async function POST(request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: { id: true, role: true }
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { name, category, description, normalRanges, isActive } = body;

    // Validate required fields
    if (!name || !category) {
      return NextResponse.json({ 
        error: 'Missing required fields: name, category' 
      }, { status: 400 });
    }

    // Check if test type with same name already exists
    const existingTestType = await db.testType.findUnique({
      where: { name }
    });

    if (existingTestType) {
      return NextResponse.json({ 
        error: 'Test type with this name already exists' 
      }, { status: 409 });
    }

    const testType = await db.testType.create({
      data: {
        name,
        category,
        description,
        normalRanges,
        isActive: isActive !== undefined ? isActive : true
      }
    });

    return NextResponse.json({ testType }, { status: 201 });
  } catch (error) {
    console.error('Test types POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}