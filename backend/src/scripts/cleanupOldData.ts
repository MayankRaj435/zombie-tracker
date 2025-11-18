import { prisma } from '../prisma';

async function cleanupOldData() {
  console.log('Cleaning up old data without userId...');
  
  try {
    // Delete all records without userId (old data)
    const deletedInstances = await prisma.idleInstance.deleteMany({
      where: { userId: null },
    });
    
    const deletedVolumes = await prisma.orphanedVolume.deleteMany({
      where: { userId: null },
    });
    
    const deletedEips = await prisma.unattachedEIP.deleteMany({
      where: { userId: null },
    });
    
    console.log(`Deleted ${deletedInstances.count} idle instances`);
    console.log(`Deleted ${deletedVolumes.count} orphaned volumes`);
    console.log(`Deleted ${deletedEips.count} unattached EIPs`);
    console.log('Cleanup complete!');
  } catch (error) {
    console.error('Error cleaning up old data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

cleanupOldData();






