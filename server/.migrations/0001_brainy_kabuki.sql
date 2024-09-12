CREATE TABLE IF NOT EXISTS "goal-completions" (
	"id" text PRIMARY KEY NOT NULL,
	"goal-id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "goal-completions" ADD CONSTRAINT "goal-completions_goal-id_goals_id_fk" FOREIGN KEY ("goal-id") REFERENCES "public"."goals"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
