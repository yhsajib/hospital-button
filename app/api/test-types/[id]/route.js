import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

// GET - Fetch single test type
export async function GET(request, { params }) {
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

    const { id } = params;

    const testType = await db.testType.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            testReports: true
          }
        }
      }
    });

    if (!testType) {
      return NextResponse.json({ error: 'Test type not found' }, { status: 404 });
    }

    return NextResponse.json({ testType });
  } catch (error) {
    console.error('Test type GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update test type
export async function PUT(request, { params }) {
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

    const { id } = params;
    const body = await request.json();

    // Check if test type exists
    const existingTestType = await db.testType.findUnique({
      where: { id }
    });

    if (!existingTestType) {
      return NextResponse.json({ error: 'Test type not found' }, { status: 404 });
    }

    const { name, category, description, normalRanges, isActive } = body;

    // Check if another test type with same name exists (excluding current one)
    if (name && name !== existingTestType.name) {
      const duplicateTestType = await db.testType.findUnique({
        where: { name }
      });

      if (duplicateTestType) {
        return NextResponse.json({ 
          error: 'Test type with this name already exists' 
        }, { status: 409 });
      }
    }

    const updatedTestType = await db.testType.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(category !== undefined && { category }),
        ...(description !== undefined && { description }),
        ...(normalRanges !== undefined && { normalRanges }),
        ...(isActive !== undefined && { isActive })
      }
    });

    return NextResponse.json({ testType: updatedTestType });
  } catch (error) {
    console.error('Test type PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete test type
export async function DELETE(request, { params }) {
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

    const { id } = params;

    // Check if test type exists
    const existingTestType = await db.testType.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            testReports: true
          }
        }
      }
    });

    if (!existingTestType) {
      return NextResponse.json({ error: 'Test type not found' }, { status: 404 });
    }

    // Check if test type has associated test reports
    if (existingTestType._count.testReports > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete test type with associated test reports. Deactivate instead.' 
      }, { status: 409 });
    }

    // Delete test type
    await db.testType.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Test type deleted successfully' });
  } catch (error) {
    console.error('Test type DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}