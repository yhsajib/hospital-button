const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding medicines...');

  const medicines = [
    {
      name: 'Paracetamol 500mg',
      genericName: 'Paracetamol',
      brandName: 'Tylenol',
      description: 'Pain reliever and fever reducer',
      price: 5.99,
      stock: 100
    },
    {
      name: 'Ibuprofen 400mg',
      genericName: 'Ibuprofen',
      brandName: 'Advil',
      description: 'Anti-inflammatory pain reliever',
      price: 8.50,
      stock: 75
    },
    {
      name: 'Amoxicillin 250mg',
      genericName: 'Amoxicillin',
      brandName: 'Amoxil',
      description: 'Antibiotic for bacterial infections',
      price: 12.99,
      stock: 50
    },
    {
      name: 'Omeprazole 20mg',
      genericName: 'Omeprazole',
      brandName: 'Prilosec',
      description: 'Proton pump inhibitor for acid reflux',
      price: 15.75,
      stock: 60
    },
    {
      name: 'Metformin 500mg',
      genericName: 'Metformin',
      brandName: 'Glucophage',
      description: 'Diabetes medication to control blood sugar',
      price: 18.25,
      stock: 40
    },
    {
      name: 'Lisinopril 10mg',
      genericName: 'Lisinopril',
      brandName: 'Prinivil',
      description: 'ACE inhibitor for high blood pressure',
      price: 22.50,
      stock: 35
    },
    {
      name: 'Atorvastatin 20mg',
      genericName: 'Atorvastatin',
      brandName: 'Lipitor',
      description: 'Statin medication to lower cholesterol',
      price: 28.99,
      stock: 45
    },
    {
      name: 'Cetirizine 10mg',
      genericName: 'Cetirizine',
      brandName: 'Zyrtec',
      description: 'Antihistamine for allergies',
      price: 9.75,
      stock: 80
    }
  ];

  for (const medicine of medicines) {
    const existingMedicine = await prisma.medicine.findFirst({
      where: {
        name: medicine.name,
        genericName: medicine.genericName
      }
    });

    if (!existingMedicine) {
      await prisma.medicine.create({
        data: medicine
      });
      console.log(`Created medicine: ${medicine.name}`);
    } else {
      console.log(`Medicine already exists: ${medicine.name}`);
    }
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });