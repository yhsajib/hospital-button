import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { sendTestReportUpdateNotification } from '@/lib/email-service';

// GET - Fetch single test report
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

    const testReport = await db.testReport.findUnique({
      where: { id },
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
            category: true,
            description: true
          }
        },
        testResults: {
          select: {
            id: true,
            parameterName: true,
            value: true,
            unit: true,
            referenceRange: true,
            status: true,
            method: true,
            notes: true
          },
          orderBy: {
            parameterName: 'asc'
          }
        }
      }
    });

    if (!testReport) {
      return NextResponse.json({ error: 'Test report not found' }, { status: 404 });
    }

    // Check authorization
    if (user.role === 'PATIENT' && testReport.patientId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({ testReport });
  } catch (error) {
    console.error('Test report GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update test report
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

    if (!user || (user.role !== 'ADMIN' && user.role !== 'DOCTOR')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();

    // Check if test report exists
    const existingReport = await db.testReport.findUnique({
      where: { id }
    });

    if (!existingReport) {
      return NextResponse.json({ error: 'Test report not found' }, { status: 404 });
    }

    const {
      testDate,
      reportDate,
      status,
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

    // Update test report with results in a transaction
    const updatedTestReport = await db.$transaction(async (tx) => {
      const report = await tx.testReport.update({
        where: { id },
        data: {
          ...(testDate && { testDate: new Date(testDate) }),
          ...(reportDate && { reportDate: new Date(reportDate) }),
          ...(status && { status }),
          ...(conductedBy !== undefined && { conductedBy }),
          ...(reviewedBy !== undefined && { reviewedBy }),
          ...(summary !== undefined && { summary }),
          ...(findings !== undefined && { findings }),
          ...(recommendations !== undefined && { recommendations }),
          ...(notes !== undefined && { notes }),
          ...(reportFileUrl !== undefined && { reportFileUrl }),
          ...(imageUrls !== undefined && { imageUrls })
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

      // Update test results if provided
      if (testResults && testResults.length > 0) {
        // Delete existing results
        await tx.testResult.deleteMany({
          where: { testReportId: id }
        });

        // Create new results
        await tx.testResult.createMany({
          data: testResults.map(result => ({
            testReportId: id,
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

    // Send email notification for status changes to completed or reviewed
    if (status && (status === 'COMPLETED' || status === 'REVIEWED')) {
      try {
        await sendTestReportUpdateNotification(updatedTestReport.id);
      } catch (error) {
        console.error('Failed to send email notification:', error);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({ testReport: updatedTestReport });
  } catch (error) {
    console.error('Test report PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete test report
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

    // Check if test report exists
    const existingReport = await db.testReport.findUnique({
      where: { id }
    });

    if (!existingReport) {
      return NextResponse.json({ error: 'Test report not found' }, { status: 404 });
    }

    // Delete test report (cascade will delete test results)
    await db.testReport.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Test report deleted successfully' });
  } catch (error) {
    console.error('Test report DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}