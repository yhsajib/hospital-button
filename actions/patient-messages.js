"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Get patient messages for the current user
 */
export async function getPatientMessages() {
  const { userId } = auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    // Get user from database
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: { id: true, role: true }
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Only patients can fetch their own messages
    if (user.role !== 'PATIENT') {
      throw new Error("Only patients can access their messages");
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

    return { messages };

  } catch (error) {
    console.error("Failed to fetch patient messages:", error);
    throw new Error("Failed to fetch messages: " + error.message);
  }
}

/**
 * Get all patient messages for admin
 */
export async function getAllPatientMessages(filters = {}) {
  const { userId } = auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    // Get user from database to check role
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: { id: true, role: true }
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Only admins can access all messages
    if (user.role !== 'ADMIN') {
      throw new Error("Admin access required");
    }

    // Build where clause
    const where = {};
    if (filters.status && filters.status !== 'all') {
      where.status = filters.status;
    }
    if (filters.messageType && filters.messageType !== 'all') {
      where.messageType = filters.messageType;
    }
    if (filters.priority && filters.priority !== 'all') {
      where.priority = filters.priority;
    }

    // Fetch messages with patient information
    const messages = await db.patientMessage.findMany({
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
    });

    return { messages };

  } catch (error) {
    console.error("Failed to fetch patient messages:", error);
    throw new Error("Failed to fetch messages: " + error.message);
  }
}

/**
 * Update message status or add admin response
 */
export async function updatePatientMessage(formData) {
  const { userId } = auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    // Get user from database to check role
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: { id: true, role: true, name: true }
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Only admins can update messages
    if (user.role !== 'ADMIN') {
      throw new Error("Admin access required");
    }

    const messageId = formData.get('messageId');
    const status = formData.get('status');
    const adminResponse = formData.get('adminResponse');

    if (!messageId) {
      throw new Error("Message ID is required");
    }

    // Check if message exists
    const existingMessage = await db.patientMessage.findUnique({
      where: { id: messageId },
      select: { id: true, status: true }
    });

    if (!existingMessage) {
      throw new Error("Message not found");
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
    const updatedMessage = await db.patientMessage.update({
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

    revalidatePath('/admin');
    return { message: updatedMessage };

  } catch (error) {
    console.error("Failed to update patient message:", error);
    throw new Error("Failed to update message: " + error.message);
  }
}

/**
 * Delete a patient message (admin only)
 */
export async function deletePatientMessage(messageId) {
  const { userId } = auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    // Get user from database to check role
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: { id: true, role: true }
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Only admins can delete messages
    if (user.role !== 'ADMIN') {
      throw new Error("Admin access required");
    }

    if (!messageId) {
      throw new Error("Message ID is required");
    }

    // Check if message exists
    const existingMessage = await db.patientMessage.findUnique({
      where: { id: messageId },
      select: { id: true }
    });

    if (!existingMessage) {
      throw new Error("Message not found");
    }

    // Delete the message
    await db.patientMessage.delete({
      where: { id: messageId },
    });

    revalidatePath('/admin');
    return { success: true };

  } catch (error) {
    console.error("Failed to delete patient message:", error);
    throw new Error("Failed to delete message: " + error.message);
  }
}

/**
 * Get message statistics for admin dashboard
 */
export async function getMessageStatistics() {
  const { userId } = auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    // Get user from database to check role
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: { id: true, role: true }
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Only admins can access statistics
    if (user.role !== 'ADMIN') {
      throw new Error("Admin access required");
    }

    const [totalMessages, pendingMessages, urgentMessages, prescriptionMessages] = await Promise.all([
      db.patientMessage.count(),
      db.patientMessage.count({ where: { status: 'PENDING' } }),
      db.patientMessage.count({ where: { priority: 'URGENT' } }),
      db.patientMessage.count({ where: { messageType: 'PRESCRIPTION' } }),
    ]);

    return {
      totalMessages,
      pendingMessages,
      urgentMessages,
      prescriptionMessages,
    };

  } catch (error) {
    console.error("Failed to fetch message statistics:", error);
    throw new Error("Failed to fetch statistics: " + error.message);
  }
}