ALTER TABLE "document" ADD COLUMN "status" text DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "document" DROP COLUMN "embeddingStatus";--> statement-breakpoint
DROP TYPE "public"."embedding_status";