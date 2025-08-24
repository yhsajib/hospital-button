import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { nanoid } from 'nanoid';

// GET - Fetch patient messages (for patients to see their own messages)
export async function GET(request) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: { id: true, role: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Only patients can fetch their own messages
    if (user.role !== 'PATIENT') {
      return NextResponse.json(
        { error: 'Only patients can access this endpoint' },
        { status: 403 }
      );
    }

    const messages = await db.patientMessage.findMany({
      where: {
        patientId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        messageNumber: true,
        subject: true,
        message: true,
        messageType: true,
        priority: true,
        status: true,
        attachments: true,
        adminResponse: true,
        respondedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ messages });

  } catch (error) {
    console.error('Failed to fetch patient messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// POST - Create new patient message
export async function POST(request) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: { id: true, role: true, name: true, email: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Only patients can create messages
    if (user.role !== 'PATIENT') {
      return NextResponse.json(
        { error: 'Only patients can create messages' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const subject = formData.get('subject');
    const message = formData.get('message');
    const messageType = formData.get('messageType') || 'GENERAL';
    const priority = formData.get('priority') || 'NORMAL';
    const files = formData.getAll('files');

    // Validate required fields
    if (!subject || !message) {
      return NextResponse.json(
        { error: 'Subject and message are required' },
        { status: 400 }
      );
    }

    // Handle file uploads if any
    const uploadedFiles = [];
    if (files && files.length > 0) {
      // Validate file types and sizes
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'text/plain'];
      const maxSize = 10 * 1024 * 1024; // 10MB

      // Create uploads directory if it doesn't exist
      const uploadsDir = join(process.cwd(), 'public', 'uploads', 'patient-messages');
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true });
      }

      for (const file of files) {
        if (file.size === 0) continue; // Skip empty files

        // Validate file type
        if (!allowedTypes.includes(file.type)) {
          return NextResponse.json(
            { error: `File type ${file.type} is not allowed. Allowed types: PDF, JPEG, PNG, TXT` },
            { status: 400 }
          );
        }

        // Validate file size
        if (file.size > maxSize) {
          return NextResponse.json(
            { error: `File ${file.name} is too large. Maximum size is 10MB` },
            { status: 400 }
          );
        }

        // Generate unique filename
        const fileExtension = file.name.split('.').pop();
        const uniqueFilename = `${nanoid()}.${fileExtension}`;
        const filePath = join(uploadsDir, uniqueFilename);

        // Save file
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        // Store relative path for database
        const relativePath = `/uploads/patient-messages/${uniqueFilename}`;
        uploadedFiles.push({
          originalName: file.name,
          filename: uniqueFilename,
          path: relativePath,
          size: file.size,
          type: file.type
        });
      }
    }

    // Generate message number
    const messageCount = await db.patientMessage.count();
    const messageNumber = `MSG-${String(messageCount + 1).padStart(6, '0')}`;

    // Create the message
    const newMessage = await db.patientMessage.create({
      data: {
        messageNumber,
        patientId: user.id,
        subject,
        message,
        messageType,
        priority,
        attachments: uploadedFiles.map(f => JSON.stringify(f)),
        status: 'PENDING',
      },
      select: {
        id: true,
        messageNumber: true,
        subject: true,
        message: true,
        messageType: true,
        priority: true,
        status: true,
        attachments: true,
        createdAt: true,
      },
    });

    // Email notifications have been removed

    return NextResponse.json({
      message: 'Message created successfully',
      data: newMessage
    });

  } catch (error) {
    console.error('Failed to create patient message:', error);
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    );
  }
}