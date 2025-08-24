import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET - Fetch all patient messages (for admin)
export async function GET(request) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from database to check role
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      select: { id: true, role: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Only admins can access this endpoint
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const messageType = searchParams.get('messageType');
    const priority = searchParams.get('priority');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Build where clause
    const where = {};
    if (status && status !== 'all') {
      where.status = status;
    }
    if (messageType && messageType !== 'all') {
      where.messageType = messageType;
    }
    if (priority && priority !== 'all') {
      where.priority = priority;
    }

    // Fetch messages with patient information
    const messages = await prisma.patientMessage.findMany({
      where,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            imageUrl: true,
          },
        },
      },
      orderBy: [
        { priority: 'desc' }, // URGENT first, then HIGH, NORMAL, LOW
        { createdAt: 'desc' },
      ],
      skip,
      take: limit,
    });

    // Get total count for pagination
    const totalCount = await prisma.patientMessage.count({ where });
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      messages,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });

  } catch (error) {
    console.error('Failed to fetch patient messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// PATCH - Update message status or add admin response
export async function PATCH(request) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from database to check role
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      select: { id: true, role: true, name: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Only admins can update messages
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { messageId, status, adminResponse } = body;

    if (!messageId) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      );
    }

    // Check if message exists
    const existingMessage = await prisma.patientMessage.findUnique({
      where: { id: messageId },
      select: { id: true, patientId: true }
    });

    if (!existingMessage) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData = {
      updatedAt: new Date(),
    };

    if (status) {
      updateData.status = status;
    }

    if (adminResponse) {
      updateData.adminResponse = adminResponse;
      updateData.respondedBy = user.id;
      updateData.respondedAt = new Date();
      
      // If adding a response, update status to RESPONDED if it's still PENDING
      if (!status && existingMessage.status === 'PENDING') {
        updateData.status = 'RESPONDED';
      }
    }

    // Update the message
    const updatedMessage = await prisma.patientMessage.update({
      where: { id: messageId },
      data: updateData,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            imageUrl: true,
          },
        },
      },
    });

    // Email notifications have been removed

    return NextResponse.json({
      message: 'Message updated successfully',
      data: updatedMessage
    });

  } catch (error) {
    console.error('Failed to update patient message:', error);
    return NextResponse.json(
      { error: 'Failed to update message' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a message (admin only)
export async function DELETE(request) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from database to check role
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      select: { id: true, role: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Only admins can delete messages
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get('messageId');

    if (!messageId) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      );
    }

    // Check if message exists
    const existingMessage = await prisma.patientMessage.findUnique({
      where: { id: messageId },
      select: { id: true }
    });

    if (!existingMessage) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    // Delete the message
    await prisma.patientMessage.delete({
      where: { id: messageId },
    });

    return NextResponse.json({
      message: 'Message deleted successfully'
    });

  } catch (error) {
    console.error('Failed to delete patient message:', error);
    return NextResponse.json(
      { error: 'Failed to delete message' },
      { status: 500 }
    );
  }
}