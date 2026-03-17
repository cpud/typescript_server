import { pgTable, timestamp, varchar, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  email: varchar("email", { length: 256 }).unique().notNull(),
  hashedPassword: varchar("hashed_password", {length: 256}).default("unset"),
});

export const chirps = pgTable("chirps", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  body: varchar("body", { length: 256 }).unique().notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, {onDelete: "cascade"})
});

export const refreshTokens = pgTable("refresh_tokens", {
  token: varchar("token").primaryKey(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  user_id: uuid("user_id")
    .notNull()
    .references(() => users.id,  {onDelete: "cascade"}),
  expiresAt: timestamp("expires_at").notNull(),
  revoked_at: timestamp("revoked_at")

})

export type NewUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect
export type NewChirp = typeof chirps.$inferInsert;
export type GetChirp = typeof chirps.$inferSelect
export type NewRefreshToken = typeof refreshTokens.$inferInsert;