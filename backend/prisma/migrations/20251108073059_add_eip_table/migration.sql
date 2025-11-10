-- CreateTable
CREATE TABLE "UnattachedEIP" (
    "id" TEXT NOT NULL,
    "publicIp" TEXT,
    "allocationId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UnattachedEIP_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UnattachedEIP_publicIp_key" ON "UnattachedEIP"("publicIp");

-- CreateIndex
CREATE UNIQUE INDEX "UnattachedEIP_allocationId_key" ON "UnattachedEIP"("allocationId");
