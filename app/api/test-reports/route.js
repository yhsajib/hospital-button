import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { sendTestReportNotification } from '@/lib/email-service';

// GET - Fetch test reports
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
    const patientId = searchParams.get('patientId');
    const status = searchParams.get('status');
    const testTypeId = searchParams.get('testTypeId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build where clause based on user role
    let whereClause = {};
    
    if (user.role === 'PATIENT') {
      // Patients can only see their own reports
      whereClause.patientId = user.id;
    } else if (user.role === 'ADMIN' || user.role === 'DOCTOR') {
      // Admins and doctors can see all reports, with optional filtering
      if (patientId) whereClause.patientId = patientId;
    } else {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (status) whereClause.status = status;
    if (testTypeId) whereClause.testTypeId = testTypeId;

    const [testReports, totalCount] = await Promise.all([
      db.testReport.findMany({
        where: whereClause,
        include: {
          patient: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          testType: {
            select: {
              id: true,
              name: true,
              category: true
            }
          },
          testResults: {
            select: {
              id: true,
              parameterName: true,
              value: true,
              unit: true,
              referenceRange: true,
              status: true
            }
          }
        },
        orderBy: {
          reportDate: 'desc'
        },
        skip,
        take: limit
      }),
      db.testReport.count({ where: whereClause })
    ]);

    return NextResponse.json({
      testReports,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Test reports GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new test report
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

    if (!user || (user.role !== 'ADMIN' && user.role !== 'DOCTOR')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const {
      patientId,
      testTypeId,
      testDate,
      reportDate,
      conductedBy,
      reviewedBy,
      summary,
      findings,
      recommendations,
      notes,
      reportFileUrl,
      imageUrls,
      testResults
    } = body;

    // Validate required fields
    if (!patientId || !testTypeId || !testDate) {
      return NextResponse.json({ 
        error: 'Missing required fields: patientId, testTypeId, testDate' 
      }, { status: 400 });
    }

    // Generate report number
    const reportCount = await db.testReport.count();
    const reportNumber = `TR${String(reportCount + 1).padStart(6, '0')}`;

    // Create test report with results in a transaction
    const testReport = await db.$transaction(async (tx) => {
      const report = await tx.testReport.create({
        data: {
          reportNumber,
          patientId,
          testTypeId,
          testDate: new Date(testDate),
          reportDate: reportDate ? new Date(reportDate) : new Date(),
          conductedBy,
          reviewedBy,
          summary,
          findings,
          recommendations,
          notes,
          reportFileUrl,
          imageUrls: imageUrls || [],
          status: 'PENDING'
        },
        include: {
          patient: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          testType: {
            select: {
              id: true,
              name: true,
              category: true
            }
          }
        }
      });

      // Create test results if provided
      if (testResults && testResults.length > 0) {
        await tx.testResult.createMany({
          data: testResults.map(result => ({
            testReportId: report.id,
            parameterName: result.parameterName,
            value: result.value,
            unit: result.unit,
            referenceRange: result.referenceRange,
            status: result.status || 'NORMAL',
            method: result.method,
            notes: result.notes
          }))
        });
      }

      return report;
    });

    // Send email notification for completed or reviewed reports
    if (testReport.status === 'COMPLETED' || testReport.status === 'REVIEWED') {
      try {
        await sendTestReportNotification(testReport.id);
      } catch (error) {
        console.error('Failed to send email notification:', error);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({ testReport }, { status: 201 });
  } catch (error) {
    console.error('Test reports POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}