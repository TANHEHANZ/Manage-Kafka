-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ADMIN', 'USER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "rol" "Rol" NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
