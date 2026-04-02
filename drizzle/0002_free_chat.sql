CREATE TABLE "userAIKnowledge" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"content" text NOT NULL,
	"category" varchar(50) DEFAULT 'preference',
	"confidence" integer DEFAULT 100,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "userSettings" ADD COLUMN "aiTone" varchar(50) DEFAULT 'friendly';--> statement-breakpoint
ALTER TABLE "userSettings" ADD COLUMN "aiLanguage" varchar(50) DEFAULT 'bilingual';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password" text;--> statement-breakpoint
ALTER TABLE "userAIKnowledge" ADD CONSTRAINT "userAIKnowledge_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;