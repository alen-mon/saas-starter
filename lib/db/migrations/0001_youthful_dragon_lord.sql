CREATE TABLE "banned_names" (
	"id" serial PRIMARY KEY NOT NULL,
	"word" varchar(255) NOT NULL,
	"normalized" varchar(255) NOT NULL,
	"source_file" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "disqualifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"reason" text NOT NULL,
	"issued_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"owner_id" integer NOT NULL,
	"owner_type" varchar(30) NOT NULL,
	"doc_type" varchar(50) NOT NULL,
	"file_path" text NOT NULL,
	"file_name" varchar(255),
	"content_type" varchar(100),
	"size" integer,
	"uploaded_at" timestamp DEFAULT now() NOT NULL,
	"verified_by" integer,
	"verified_at" timestamp,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "motorcycles" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_member_id" integer NOT NULL,
	"brand" varchar(100),
	"model" varchar(100),
	"cc" integer,
	"reg_number" varchar(50),
	"rc_doc_id" integer,
	"pucc_doc_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"method" varchar(50) NOT NULL,
	"status" varchar(30) DEFAULT 'pending' NOT NULL,
	"txn_ref" varchar(255),
	"proof_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "invitations" ADD COLUMN "token" varchar(255);--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "status" varchar(30) DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "slots_paid" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "disqualifications" ADD CONSTRAINT "disqualifications_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "motorcycles" ADD CONSTRAINT "motorcycles_team_member_id_team_members_id_fk" FOREIGN KEY ("team_member_id") REFERENCES "public"."team_members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;