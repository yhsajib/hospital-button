const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUserRole() {
  const clerkUserId = process.argv[2];
  
  if (!clerkUserId) {
    console.error('Please provide a Clerk User ID as an argument');
    console.log('Usage: node scripts/check-user-role.js <clerk-user-id>');
    console.log('\nTo find your Clerk User ID:');
    console.log('1. Log into your application');
    console.log('2. Open browser developer tools (F12)');
    console.log('3. Go to Console tab');
    console.log('4. Type: localStorage.getItem("clerk-user")');
    console.log('5. Look for the "id" field in the returned JSON');
    process.exit(1);
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        clerkUserId: clerkUserId
      }
    });

    if (!user) {
      console.error(`❌ User with Clerk ID ${clerkUserId} not found in database`);
      console.log('\nThis means the user hasn\'t logged into the application yet.');
      console.log('Please log in first, then run this script again.');
      process.exit(1);
    }

    console.log('✅ User found in database:');
    console.log(`Name: ${user.name || 'Not set'}`);
    console.log(`Email: ${user.email}`);
    console.log(`Role: ${user.role}`);
    console.log(`Clerk ID: ${user.clerkUserId}`);
    console.log(`Database ID: ${user.id}`);
    console.log(`Created: ${user.createdAt}`);
    
    if (user.role === 'ADMIN') {
      console.log('\n🎉 This user already has ADMIN role!');
    } else {
      console.log(`\n⚠️  This user has role: ${user.role}`);
      console.log('To make this user an admin, run:');
      console.log(`node scripts/make-admin.js ${clerkUserId}`);
    }
    
  } catch (error) {
    console.error('Error checking user role:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserRole();