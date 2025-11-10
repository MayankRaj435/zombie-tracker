-- AlterTable: Make userId NOT NULL for IdleInstance
ALTER TABLE "IdleInstance" ALTER COLUMN "userId" SET NOT NULL;

-- AlterTable: Make userId NOT NULL for OrphanedVolume
ALTER TABLE "OrphanedVolume" ALTER COLUMN "userId" SET NOT NULL;

-- AlterTable: Make userId NOT NULL for UnattachedEIP
ALTER TABLE "UnattachedEIP" ALTER COLUMN "userId" SET NOT NULL;

-- CreateIndex: Add unique constraint for IdleInstance (instanceId, userId)
CREATE UNIQUE INDEX "IdleInstance_instanceId_userId_key" ON "IdleInstance"("instanceId", "userId");

-- CreateIndex: Add unique constraint for OrphanedVolume (volumeId, userId)
CREATE UNIQUE INDEX "OrphanedVolume_volumeId_userId_key" ON "OrphanedVolume"("volumeId", "userId");

-- CreateIndex: Add unique constraint for UnattachedEIP (allocationId, userId)
CREATE UNIQUE INDEX "UnattachedEIP_allocationId_userId_key" ON "UnattachedEIP"("allocationId", "userId");


