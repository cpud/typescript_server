import { db } from "../index.js";
import { NewUser, refreshTokens, users, User } from "../schema.js";
import { eq } from "drizzle-orm";

export async function createUser(user: NewUser) {
  const [result] = await db
    .insert(users)
    .values(user)
    .onConflictDoNothing()
    .returning();
  return result;
}

export async function reset() {
  await db.delete(users);
}

export async function getUserByEmail(email: string) {
  const [result] = await db
    .select()
    .from(users)
    .where(eq(users.email, email));
  return result;
}

export async function updateUserEmailPassword(id: string, email: string, hashedPassword: string) {
  const [result] = await db.update(users)
    .set({hashedPassword: hashedPassword,
          email: email,
          updatedAt: new Date(),
    })
    .where(eq(users.id, id))
    .returning();

  return result;
}

export async function makeUserRedById(userId: string) {
  const [result] = await db.update(users)
    .set({
      isChirpyRed: true,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning();
  return result;
}
