const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestPatients() {
  console.log('Creating test patients...');

  const testPatients = [
    {
      clerkUserId: 'test_patient_1',
      email: 'john.doe@example.com',
      name: 'John Doe',
      role: 'PATIENT'
    },
    {
      clerkUserId: 'test_patient_2', 
      email: 'jane.smith@example.com',
      name: 'Jane Smith',
      role: 'PATIENT'
    },
    {
      clerkUserId: 'test_patient_3',
      email: 'mike.johnson@example.com', 
      name: 'Mike Johnson',
      role: 'PATIENT'
    },
    {
      clerkUserId: 'test_patient_4',
      email: 'sarah.wilson@example.com',
      name: 'Sarah Wilson', 
      role: 'PATIENT'
    },
    {
      clerkUserId: 'test_patient_5',
      email: 'david.brown@example.com',
      name: 'David Brown',
      role: 'PATIENT'
    }
  ];

  for (const patient of testPatients) {
    try {
      const existingPatient = await prisma.user.findFirst({
        where: {
          email: patient.email
        }
      });

      if (!existingPatient) {
        await prisma.user.create({
          data: patient
        });
        console.log(`Created patient: ${patient.name} (${patient.email})`);
      } else {
        console.log(`Patient already exists: ${patient.name} (${patient.email})`);
      }
    } catch (error) {
      console.error(`Error creating patient ${patient.name}:`, error);
    }
  }

  console.log('Test patients creation completed!');
}

createTestPatients()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });