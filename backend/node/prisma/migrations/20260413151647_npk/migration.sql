/*
  Warnings:

  - Added the required column `nitrogen` to the `FertilizerRecommendation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ph` to the `FertilizerRecommendation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phosphorus` to the `FertilizerRecommendation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `potassium` to the `FertilizerRecommendation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FertilizerRecommendation" ADD COLUMN     "nitrogen" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "ph" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "phosphorus" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "potassium" DOUBLE PRECISION NOT NULL;
