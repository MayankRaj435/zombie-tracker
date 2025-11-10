-- CreateTable
CREATE TABLE "IdleInstance" (
    "id" TEXT NOT NULL,
    "instanceId" TEXT NOT NULL,
    "instanceType" TEXT,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IdleInstance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrphanedVolume" (
    "id" TEXT NOT NULL,
    "volumeId" TEXT NOT NULL,
    "sizeGb" INTEGER,
    "volumeType" TEXT,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrphanedVolume_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IdleInstance_instanceId_key" ON "IdleInstance"("instanceId");

-- CreateIndex
CREATE UNIQUE INDEX "OrphanedVolume_volumeId_key" ON "OrphanedVolume"("volumeId");
