const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function makeAdmin() {
  // Get the Clerk User ID from command line arguments
  const clerkUserId = process.argv[2];
  
  if (!clerkUserId) {
    console.error('Please provide a Clerk User ID as an argument');
    console.log('Usage: node scripts/make-admin.js <clerk-user-id>');
    console.log('You can find your Clerk User ID in the Clerk dashboard or by logging it in your app');
    process.exit(1);
  }

  try {
    // Find the user by Clerk ID
    const user = await prisma.user.findUnique({
      where: {
        clerkUserId: clerkUserId
      }
    });

    if (!user) {
      console.error(`User with Clerk ID ${clerkUserId} not found`);
      console.log('Make sure the user has logged into the application at least once');
      process.exit(1);
    }

    // Update user role to ADMIN
    const updatedUser = await prisma.user.update({
      where: {
        clerkUserId: clerkUserId
      },
      data: {
        role: 'ADMIN'
      }
    });

    console.log(`Successfully updated user ${updatedUser.name || updatedUser.email} to ADMIN role`);
    console.log(`User ID: ${updatedUser.id}`);
    console.log(`Clerk ID: ${updatedUser.clerkUserId}`);
    console.log(`Role: ${updatedUser.role}`);
    
  } catch (error) {
    console.error('Error updating user role:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

makeAdmin();