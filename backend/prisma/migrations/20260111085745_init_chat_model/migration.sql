/*
  Warnings:

  - You are about to drop the column `ai_response` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the column `user_message` on the `Chat` table. All the data in the column will be lost.
  - Added the required column `content` to the `Chat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `Chat` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Chat" DROP COLUMN "ai_response",
DROP COLUMN "user_message",
ADD COLUMN     "content" TEXT NOT NULL,
ADD COLUMN     "role" TEXT NOT NULL;
