CREATE TABLE "verificationCodes" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(320) NOT NULL,
	"code" varchar(10) NOT NULL,
	"type" varchar(50) NOT NULL,
	"name" text,
	"passwordHash" text,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
