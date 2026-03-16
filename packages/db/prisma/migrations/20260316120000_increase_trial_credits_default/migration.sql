-- AlterTable: increase default trialCredits from 3 to 10
ALTER TABLE "users" ALTER COLUMN "trialCredits" SET DEFAULT 10;

-- Update existing users who still have the old default (3 unused trial credits)
UPDATE "users" SET "trialCredits" = 10 WHERE "trialCredits" = 3;
