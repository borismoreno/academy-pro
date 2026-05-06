-- AlterTable: add height and weight to players
ALTER TABLE "players" ADD COLUMN "height" DOUBLE PRECISION;
ALTER TABLE "players" ADD COLUMN "weight" DOUBLE PRECISION;

-- AlterTable: make coach_id nullable in attendance_sessions
ALTER TABLE "attendance_sessions" DROP CONSTRAINT IF EXISTS "attendance_sessions_coach_id_fkey";
ALTER TABLE "attendance_sessions" ALTER COLUMN "coach_id" DROP NOT NULL;
ALTER TABLE "attendance_sessions" ADD CONSTRAINT "attendance_sessions_coach_id_fkey"
    FOREIGN KEY ("coach_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
