-- CreateTable
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL,
    "platformName" TEXT NOT NULL,
    "description" TEXT,
    "endpointUrl" TEXT,
    "docsUrl" TEXT,
    "keyLabel" TEXT NOT NULL,
    "keyValue" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "expirationDate" TIMESTAMP(3),
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ApiKey_platformName_idx" ON "ApiKey"("platformName");

-- CreateIndex
CREATE INDEX "ApiKey_isActive_idx" ON "ApiKey"("isActive");