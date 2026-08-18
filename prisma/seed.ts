// prisma/seed.ts
import { PrismaClient, DispatchMethod } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const merchants = [
    {
      slug: 'planet-fitness',
      name: 'Planet Fitness Headquarters',
      category: 'Gym',
      cancellationType: DispatchMethod.HYBRID_BOTH,
      recipientName: 'Planet Fitness Member Relations',
      addressLine1: '400 Fox Run Rd',
      city: 'Newington',
      state: 'NH',
      postalCode: '03801',
      faxNumber: '+16037500001',
      statutoryClause: 'Pursuant to state consumer protection statutes and the original membership terms, this written instrument serves as unconditional formal notice of immediate termination of all membership agreements and revocation of electronic funds transfer (EFT) authorization.'
    },
    {
      slug: 'la-fitness',
      name: 'LA Fitness (Fitness International, LLC)',
      category: 'Gym',
      cancellationType: DispatchMethod.CERTIFIED_MAIL,
      recipientName: 'Operations Support Group / Cancellations',
      addressLine1: 'PO Box 54170',
      city: 'Irvine',
      state: 'CA',
      postalCode: '92619',
      faxNumber: null,
      statutoryClause: 'Notice is hereby given that the undersigned consumer terminates all agreements with Fitness International, LLC. Revocation of recurring ACH debit permissions is effective immediately under federal Regulation E.'
    },
    {
      slug: 'comcast-xfinity',
      name: 'Comcast / Xfinity Legal Services',
      category: 'Telecom',
      cancellationType: DispatchMethod.HYBRID_BOTH,
      recipientName: 'Comcast Cable Legal Department',
      addressLine1: '1701 John F Kennedy Blvd',
      city: 'Philadelphia',
      state: 'PA',
      postalCode: '19103',
      faxNumber: '+12152865801',
      statutoryClause: 'Under the FTC Click-to-Cancel and unfair deceptive billing trade regulations, I demand unconditional termination of telecom and internet account services as of the date postmarked.'
    }
  ];

  for (const m of merchants) {
    await prisma.merchant.upsert({
      where: { slug: m.slug },
      update: {},
      create: m,
    });
  }

  console.log('✅ Production merchants seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
