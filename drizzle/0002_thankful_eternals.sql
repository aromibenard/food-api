ALTER TABLE "meals" RENAME COLUMN "name" TO "title";--> statement-breakpoint
ALTER TABLE "meals" RENAME COLUMN "description" TO "url";--> statement-breakpoint
ALTER TABLE "meals" ALTER COLUMN "image_url" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "meals" DROP COLUMN "category";--> statement-breakpoint
ALTER TABLE "meals" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "meals" DROP COLUMN "updated_at";