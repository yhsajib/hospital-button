import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { nanoid } from 'nanoid';
import { db } from '@/lib/prisma';

export async function POST(request) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from database to check role
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

    // Only admins and doctors can upload test report files
    if (!['ADMIN', 'DOCTOR'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll('files');
    const reportId = formData.get('reportId');

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    // Validate file types and sizes
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    const uploadedFiles = [];

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'test-reports');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    for (const file of files) {
      if (!file || typeof file === 'string') continue;

      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid file type: ${file.type}. Allowed types: PDF, JPEG, PNG` },
          { status: 400 }
        );
      }

      // Validate file size
      if (file.size > maxSize) {
        return NextResponse.json(
          { error: `File too large: ${file.name}. Maximum size is 10MB` },
          { status: 400 }
        );
      }

      // Generate unique filename
      const fileExtension = file.name.split('.').pop();
      const uniqueFilename = `${nanoid()}-${Date.now()}.${fileExtension}`;
      const filePath = join(uploadsDir, uniqueFilename);

      // Convert file to buffer and save
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);

      // Store file info
      uploadedFiles.push({
        originalName: file.name,
        filename: uniqueFilename,
        path: `/uploads/test-reports/${uniqueFilename}`,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
        uploadedBy: user.id
      });
    }

    // If reportId is provided, associate files with the report
    if (reportId) {
      // Verify the report exists and user has permission to modify it
      const report = await db.testReport.findUnique({
        where: { id: reportId },
        select: { id: true, patientId: true }
      });

      if (!report) {
        return NextResponse.json(
          { error: 'Test report not found' },
          { status: 404 }
        );
      }

      // Update the report with file attachments
      await db.testReport.update({
        where: { id: reportId },
        data: {
          attachments: {
            push: uploadedFiles
          },
          updatedAt: new Date()
        }
      });
    }

    return NextResponse.json({
      message: 'Files uploaded successfully',
      files: uploadedFiles
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload files' },
      { status: 500 }
    );
  }
}

// Handle file download
export async function GET(request) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');
    const reportId = searchParams.get('reportId');

    if (!filename || !reportId) {
      return NextResponse.json(
        { error: 'Missing filename or reportId' },
        { status: 400 }
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

    // Get the test report to check permissions
    const report = await db.testReport.findUnique({
      where: { id: reportId },
      select: { 
        id: true, 
        patientId: true, 
        attachments: true 
      }
    });

    if (!report) {
      return NextResponse.json(
        { error: 'Test report not found' },
        { status: 404 }
      );
    }

    // Check permissions: patients can only access their own reports
    if (user.role === 'PATIENT' && report.patientId !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Verify the file exists in the report's attachments
    const fileExists = report.attachments?.some(attachment => 
      attachment.filename === filename
    );

    if (!fileExists) {
      return NextResponse.json(
        { error: 'File not found in report attachments' },
        { status: 404 }
      );
    }

    // Return the file path for download
    const filePath = `/uploads/test-reports/${filename}`;
    
    return NextResponse.json({
      downloadUrl: filePath,
      filename: filename
    });

  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: 'Failed to process download request' },
      { status: 500 }
    );
  }
}