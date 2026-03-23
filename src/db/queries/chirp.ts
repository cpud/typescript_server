import { db } from "../index.js";
import { NewChirp, chirps } from "../schema.js";
import { asc, eq } from "drizzle-orm";

export async function createChirp(chirp: NewChirp) {
  const [result] = await db
    .insert(chirps)
    .values(chirp)
    .onConflictDoNothing()
    .returning();
  return result;
}

export async function getChirps() {
  const result = await db
    .select()
    .from(chirps)
    .orderBy(asc(chirps.createdAt));
  return result;
}

export async function getChirpsAuthorId(authorId: string) {
  const result = await db
    .select()
    .from(chirps)
    .where(eq(chirps.userId, authorId));
  return result;
}


export async function getChirp(chirpId: string) {
  const result = await db
    .select()
    .from(chirps)
    .where(eq(chirps.id, chirpId))
  return result[0];
}

export async function deleteChirp(chirpId: string) {
  const result = await db
    .delete(chirps)
    .where(eq(chirps.id, chirpId))
    .returning();
  return result;
}

export async function reset() {
  await db.delete(chirps);
}