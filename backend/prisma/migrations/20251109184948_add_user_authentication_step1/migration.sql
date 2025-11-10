-- DropIndex
DROP INDEX "IdleInstance_instanceId_key";

-- DropIndex
DROP INDEX "OrphanedVolume_volumeId_key";

-- DropIndex
DROP INDEX "UnattachedEIP_allocationId_key";

-- DropIndex
DROP INDEX "UnattachedEIP_publicIp_key";

-- AlterTable
ALTER TABLE "IdleInstance" ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "OrphanedVolume" ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "UnattachedEIP" ADD COLUMN     "userId" TEXT;

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "awsAccessKeyId" TEXT,
    "awsSecretAccessKey" TEXT,
    "awsRegion" TEXT,
    "awsConnected" BOOLEAN NOT NULL DEFAULT false,
    "awsConnectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "IdleInstance_userId_idx" ON "IdleInstance"("userId");

-- CreateIndex
CREATE INDEX "OrphanedVolume_userId_idx" ON "OrphanedVolume"("userId");

-- CreateIndex
CREATE INDEX "UnattachedEIP_userId_idx" ON "UnattachedEIP"("userId");

-- AddForeignKey
ALTER TABLE "IdleInstance" ADD CONSTRAINT "IdleInstance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrphanedVolume" ADD CONSTRAINT "OrphanedVolume_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnattachedEIP" ADD CONSTRAINT "UnattachedEIP_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
