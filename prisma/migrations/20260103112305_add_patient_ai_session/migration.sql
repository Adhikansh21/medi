-- CreateTable
CREATE TABLE "public"."PatientAISession" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "lastDisease" TEXT,
    "conversation" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientAISession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PatientAISession_patientId_key" ON "public"."PatientAISession"("patientId");

-- AddForeignKey
ALTER TABLE "public"."PatientAISession" ADD CONSTRAINT "PatientAISession_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
