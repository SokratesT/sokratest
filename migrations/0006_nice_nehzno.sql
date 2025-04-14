ALTER TABLE "chat_message" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "chat_message" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "chat_message" ALTER COLUMN "role" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "chat" ALTER COLUMN "title" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "chat_message" ADD COLUMN "parts" json NOT NULL;--> statement-breakpoint
ALTER TABLE "chat_message" ADD COLUMN "attachments" json NOT NULL;--> statement-breakpoint
ALTER TABLE "chat_message" ADD COLUMN "annotations" json NOT NULL;--> statement-breakpoint
ALTER TABLE "chat_message" DROP COLUMN "content";--> statement-breakpoint
ALTER TABLE "chat_message" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "chat" DROP COLUMN "visibility";