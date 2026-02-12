import { prisma } from '../prisma';

async function cleanupOldData() {
  console.log('Cleaning up old data without userId...');
  
  try {
    // `userId` is non-nullable in the current Prisma schema, but older databases
    // could still contain rows with NULL values. Prisma won't allow filtering
    // by `null` for non-nullable fields, so we use raw SQL.
    const deletedInstances = await prisma.$executeRawUnsafe(
      'DELETE FROM "IdleInstance" WHERE "userId" IS NULL'
    );
    const deletedVolumes = await prisma.$executeRawUnsafe(
      'DELETE FROM "OrphanedVolume" WHERE "userId" IS NULL'
    );
    const deletedEips = await prisma.$executeRawUnsafe(
      'DELETE FROM "UnattachedEIP" WHERE "userId" IS NULL'
    );

    console.log(`Deleted ${deletedInstances} idle instances`);
    console.log(`Deleted ${deletedVolumes} orphaned volumes`);
    console.log(`Deleted ${deletedEips} unattached EIPs`);
    console.log('Cleanup complete!');
  } catch (error) {
    console.error('Error cleaning up old data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

cleanupOldData();






