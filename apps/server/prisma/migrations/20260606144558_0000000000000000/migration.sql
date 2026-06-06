-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'COMPANY_SUPER_ADMIN', 'COMPANY_STAFF', 'COMPANY_PARTNER', 'CONSUMER');

-- CreateEnum
CREATE TYPE "OrganizationType" AS ENUM ('ROOT', 'BRANCH');

-- CreateEnum
CREATE TYPE "OtpType" AS ENUM ('LOGIN', 'PASSWORD_RESET', 'VERIFY_EMAIL', 'VERIFY_PHONE');

-- CreateTable
CREATE TABLE "FormSchema" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "orgId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "schema" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "linkedBrandSchemaId" UUID,
    "linkedCategorySchemaId" UUID,
    "parentProductSchemaId" UUID,

    CONSTRAINT "FormSchema_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormData" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "orgId" UUID NOT NULL,
    "formSchemaId" UUID NOT NULL,
    "formType" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "parentProductDataId" UUID,
    "registeredProductId" UUID,
    "brandFormDataId" UUID,
    "createdBy" UUID,
    "updatedBy" UUID,

    CONSTRAINT "FormData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "OrganizationType" NOT NULL DEFAULT 'ROOT',
    "enabledModules" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "rootId" UUID,
    "parentId" UUID,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OtpVerification" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "type" "OtpType" NOT NULL,
    "expiresAt" TIMESTAMPTZ NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OtpVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Persona" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Persona_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationPersona" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "orgId" UUID NOT NULL,
    "personaId" UUID NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "enabledBy" TEXT NOT NULL,

    CONSTRAINT "OrganizationPersona_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DealerType" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "orgId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "partnerType" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "DealerType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DealerTypePersona" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "dealerTypeId" UUID NOT NULL,
    "personaId" UUID NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "DealerTypePersona_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DealerPersona" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "personaId" UUID NOT NULL,
    "dealerTypeId" UUID,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "assignedBy" TEXT NOT NULL,

    CONSTRAINT "DealerPersona_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT,
    "phoneNumber" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "passwordHash" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'CONSUMER',
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "deletedAt" TIMESTAMPTZ,
    "deletedBy" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAccess" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "portalType" TEXT NOT NULL,
    "role" TEXT,
    "partnerType" TEXT,
    "dealerTypeId" UUID,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "UserAccess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WarrantyTemplate" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "orgId" UUID NOT NULL,
    "formSchemaId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "warrantyType" TEXT NOT NULL,
    "validationRules" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "WarrantyTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Warranty" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "registrationFormDataId" UUID NOT NULL,
    "warrantyTemplateId" UUID NOT NULL,
    "productFormDataId" UUID NOT NULL,
    "partFormDataId" UUID,
    "isApplicable" BOOLEAN NOT NULL DEFAULT false,
    "templateSnapshot" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "Warranty_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FormSchema_orgId_type_name_version_key" ON "FormSchema"("orgId", "type", "name", "version");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");

-- CreateIndex
CREATE INDEX "Organization_slug_idx" ON "Organization"("slug");

-- CreateIndex
CREATE INDEX "OtpVerification_userId_idx" ON "OtpVerification"("userId");

-- CreateIndex
CREATE INDEX "OtpVerification_code_idx" ON "OtpVerification"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Persona_code_key" ON "Persona"("code");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationPersona_orgId_personaId_key" ON "OrganizationPersona"("orgId", "personaId");

-- CreateIndex
CREATE UNIQUE INDEX "DealerTypePersona_dealerTypeId_personaId_key" ON "DealerTypePersona"("dealerTypeId", "personaId");

-- CreateIndex
CREATE UNIQUE INDEX "DealerPersona_userId_orgId_personaId_key" ON "DealerPersona"("userId", "orgId", "personaId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneNumber_key" ON "User"("phoneNumber");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_phoneNumber_idx" ON "User"("phoneNumber");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "UserAccess_userId_idx" ON "UserAccess"("userId");

-- CreateIndex
CREATE INDEX "UserAccess_orgId_idx" ON "UserAccess"("orgId");

-- CreateIndex
CREATE INDEX "UserAccess_portalType_idx" ON "UserAccess"("portalType");

-- CreateIndex
CREATE UNIQUE INDEX "UserAccess_userId_orgId_key" ON "UserAccess"("userId", "orgId");

-- CreateIndex
CREATE UNIQUE INDEX "WarrantyTemplate_orgId_formSchemaId_name_version_key" ON "WarrantyTemplate"("orgId", "formSchemaId", "name", "version");

-- AddForeignKey
ALTER TABLE "FormSchema" ADD CONSTRAINT "FormSchema_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormSchema" ADD CONSTRAINT "FormSchema_linkedBrandSchemaId_fkey" FOREIGN KEY ("linkedBrandSchemaId") REFERENCES "FormSchema"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormSchema" ADD CONSTRAINT "FormSchema_linkedCategorySchemaId_fkey" FOREIGN KEY ("linkedCategorySchemaId") REFERENCES "FormSchema"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormSchema" ADD CONSTRAINT "FormSchema_parentProductSchemaId_fkey" FOREIGN KEY ("parentProductSchemaId") REFERENCES "FormSchema"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormData" ADD CONSTRAINT "FormData_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormData" ADD CONSTRAINT "FormData_formSchemaId_fkey" FOREIGN KEY ("formSchemaId") REFERENCES "FormSchema"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormData" ADD CONSTRAINT "FormData_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormData" ADD CONSTRAINT "FormData_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormData" ADD CONSTRAINT "FormData_parentProductDataId_fkey" FOREIGN KEY ("parentProductDataId") REFERENCES "FormData"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormData" ADD CONSTRAINT "FormData_registeredProductId_fkey" FOREIGN KEY ("registeredProductId") REFERENCES "FormData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormData" ADD CONSTRAINT "FormData_brandFormDataId_fkey" FOREIGN KEY ("brandFormDataId") REFERENCES "FormData"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_rootId_fkey" FOREIGN KEY ("rootId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OtpVerification" ADD CONSTRAINT "OtpVerification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationPersona" ADD CONSTRAINT "OrganizationPersona_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationPersona" ADD CONSTRAINT "OrganizationPersona_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "Persona"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealerType" ADD CONSTRAINT "DealerType_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealerTypePersona" ADD CONSTRAINT "DealerTypePersona_dealerTypeId_fkey" FOREIGN KEY ("dealerTypeId") REFERENCES "DealerType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealerTypePersona" ADD CONSTRAINT "DealerTypePersona_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "Persona"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealerPersona" ADD CONSTRAINT "DealerPersona_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealerPersona" ADD CONSTRAINT "DealerPersona_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealerPersona" ADD CONSTRAINT "DealerPersona_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "Persona"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealerPersona" ADD CONSTRAINT "DealerPersona_dealerTypeId_fkey" FOREIGN KEY ("dealerTypeId") REFERENCES "DealerType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAccess" ADD CONSTRAINT "UserAccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAccess" ADD CONSTRAINT "UserAccess_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAccess" ADD CONSTRAINT "UserAccess_dealerTypeId_fkey" FOREIGN KEY ("dealerTypeId") REFERENCES "DealerType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WarrantyTemplate" ADD CONSTRAINT "WarrantyTemplate_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WarrantyTemplate" ADD CONSTRAINT "WarrantyTemplate_formSchemaId_fkey" FOREIGN KEY ("formSchemaId") REFERENCES "FormSchema"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Warranty" ADD CONSTRAINT "Warranty_registrationFormDataId_fkey" FOREIGN KEY ("registrationFormDataId") REFERENCES "FormData"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Warranty" ADD CONSTRAINT "Warranty_warrantyTemplateId_fkey" FOREIGN KEY ("warrantyTemplateId") REFERENCES "WarrantyTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Warranty" ADD CONSTRAINT "Warranty_productFormDataId_fkey" FOREIGN KEY ("productFormDataId") REFERENCES "FormData"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Warranty" ADD CONSTRAINT "Warranty_partFormDataId_fkey" FOREIGN KEY ("partFormDataId") REFERENCES "FormData"("id") ON DELETE CASCADE ON UPDATE CASCADE;
