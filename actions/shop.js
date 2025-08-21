"use server";

import { db } from "@/lib/prisma";

/**
 * Gets all medicines from the database (public access)
 * This function is used by the shop page and doesn't require authentication
 */
export async function getMedicines() {
  try {
    const medicines = await db.medicine.findMany({
      where: {
        stock: {
          gt: 0 // Only show medicines that are in stock
        }
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { medicines };
  } catch (error) {
    console.error("Failed to fetch medicines:", error);
    throw new Error("Failed to fetch medicines: " + error.message);
  }
}

/**
 * Gets a single medicine by ID (public access)
 */
export async function getMedicineById(id) {
  try {
    const medicine = await db.medicine.findUnique({
      where: {
        id: id,
      },
    });

    if (!medicine) {
      throw new Error("Medicine not found");
    }

    return { medicine };
  } catch (error) {
    console.error("Failed to fetch medicine:", error);
    throw new Error("Failed to fetch medicine: " + error.message);
  }
}