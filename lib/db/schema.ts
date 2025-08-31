// lib/db/schema.ts
import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  numeric,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: varchar("role", { length: 20 }).notNull().default("member"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  stripeCustomerId: text("stripe_customer_id").unique(),
  stripeSubscriptionId: text("stripe_subscription_id").unique(),
  stripeProductId: text("stripe_product_id"),
  planName: varchar("plan_name", { length: 50 }),
  subscriptionStatus: varchar("subscription_status", { length: 20 }),
  status: varchar("status", { length: 30 }).notNull().default("pending"),
  slotsPaid: integer("slots_paid").notNull().default(0),
});

export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  teamId: integer("team_id")
    .notNull()
    .references(() => teams.id),
  role: varchar("role", { length: 50 }).notNull(),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
});

export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id")
    .notNull()
    .references(() => teams.id),
  userId: integer("user_id").references(() => users.id),
  action: text("action").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  ipAddress: varchar("ip_address", { length: 45 }),
});

export const invitations = pgTable("invitations", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id")
    .notNull()
    .references(() => teams.id),
  email: varchar("email", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull(),
  invitedBy: integer("invited_by")
    .notNull()
    .references(() => users.id),
  invitedAt: timestamp("invited_at").notNull().defaultNow(),
  token: varchar("token", { length: 255 }),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
});

/* ===== New tables for NE Advenduro ===== */

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  ownerId: integer("owner_id").notNull(),
  ownerType: varchar("owner_type", { length: 30 }).notNull(), // 'user' | 'team_member' | 'team'
  docType: varchar("doc_type", { length: 50 }).notNull(), // license, rc, medical, waiver, checkpoint_photo
  filePath: text("file_path").notNull(),
  fileName: varchar("file_name", { length: 255 }),
  contentType: varchar("content_type", { length: 100 }),
  size: integer("size"),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
  verifiedBy: integer("verified_by"),
  verifiedAt: timestamp("verified_at"),
  notes: text("notes"),
});

export const motorcycles = pgTable("motorcycles", {
  id: serial("id").primaryKey(),
  teamMemberId: integer("team_member_id")
    .notNull()
    .references(() => teamMembers.id),
  brand: varchar("brand", { length: 100 }),
  model: varchar("model", { length: 100 }),
  cc: integer("cc"),
  regNumber: varchar("reg_number", { length: 50 }),
  rcDocId: integer("rc_doc_id"),
  puccDocId: integer("pucc_doc_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id")
    .notNull()
    .references(() => teams.id),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  method: varchar("method", { length: 50 }).notNull(), // UPI_QR | GATEWAY
  status: varchar("status", { length: 30 }).notNull().default("pending"),
  txnRef: varchar("txn_ref", { length: 255 }),
  proofUrl: text("proof_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const bannedNames = pgTable("banned_names", {
  id: serial("id").primaryKey(),
  word: varchar("word", { length: 255 }).notNull(),
  normalized: varchar("normalized", { length: 255 }).notNull(),
  sourceFile: varchar("source_file", { length: 255 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const disqualifications = pgTable("disqualifications", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id")
    .notNull()
    .references(() => teams.id),
  reason: text("reason").notNull(),
  issuedBy: integer("issued_by"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/* ===== relations (existing ones preserved) ===== */

export const teamsRelations = relations(teams, ({ many }) => ({
  teamMembers: many(teamMembers),
  activityLogs: many(activityLogs),
  invitations: many(invitations),
}));

export const usersRelations = relations(users, ({ many }) => ({
  teamMembers: many(teamMembers),
  invitationsSent: many(invitations),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  team: one(teams, {
    fields: [invitations.teamId],
    references: [teams.id],
  }),
  invitedBy: one(users, {
    fields: [invitations.invitedBy],
    references: [users.id],
  }),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  team: one(teams, {
    fields: [activityLogs.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

/* Relations for new tables (minimal where sensible) */

export const documentsRelations = relations(documents, ({}) => ({}));

export const motorcyclesRelations = relations(motorcycles, ({ one }) => ({
  teamMember: one(teamMembers, {
    fields: [motorcycles.teamMemberId],
    references: [teamMembers.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  team: one(teams, {
    fields: [payments.teamId],
    references: [teams.id],
  }),
}));

export const bannedNamesRelations = relations(bannedNames, ({}) => ({}));

export const disqualificationsRelations = relations(
  disqualifications,
  ({ one }) => ({
    team: one(teams, {
      fields: [disqualifications.teamId],
      references: [teams.id],
    }),
  })
);

/* ===== Type exports ===== */

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;
/* New types */
export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
export type Motorcycle = typeof motorcycles.$inferSelect;
export type NewMotorcycle = typeof motorcycles.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
export type BannedName = typeof bannedNames.$inferSelect;
export type NewBannedName = typeof bannedNames.$inferInsert;
export type Disqualification = typeof disqualifications.$inferSelect;
export type NewDisqualification = typeof disqualifications.$inferInsert;

export type TeamDataWithMembers = Team & {
  teamMembers: (TeamMember & {
    user: Pick<User, "id" | "name" | "email">;
  })[];
};

export enum ActivityType {
  SIGN_UP = "SIGN_UP",
  SIGN_IN = "SIGN_IN",
  SIGN_OUT = "SIGN_OUT",
  UPDATE_PASSWORD = "UPDATE_PASSWORD",
  DELETE_ACCOUNT = "DELETE_ACCOUNT",
  UPDATE_ACCOUNT = "UPDATE_ACCOUNT",
  CREATE_TEAM = "CREATE_TEAM",
  REMOVE_TEAM_MEMBER = "REMOVE_TEAM_MEMBER",
  INVITE_TEAM_MEMBER = "INVITE_TEAM_MEMBER",
  ACCEPT_INVITATION = "ACCEPT_INVITATION",
}
