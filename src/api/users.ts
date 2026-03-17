import type { Request, Response } from "express";

import { createUser, getUserByEmail } from "../db/queries/users.js";
import { BadRequestError, UserNotAuthenticatedError } from "./errors.js";
import { respondWithJSON } from "./json.js";
import { hashPassword, checkPasswordHash } from "../auth.js";
import { NewUser } from "../db/schema.js";
import { hash } from "node:crypto";
import { check } from "drizzle-orm/gel-core/checks.js";

export type UserResponse = Omit<NewUser, "hashedPassword">;

export async function handlerUsersCreate(req: Request, res: Response) {
  type parameters = {
    email: string;
    password: string;
  };
  const params: parameters = req.body;

  const hashedPassword = await hashPassword(params.password);
  //console.log(`password hash: ${hashedPassword}`);


  if (!params.email) {
    throw new BadRequestError("Missing required fields");
  }

  if (!params.password || !params.email) {
    throw new BadRequestError("Missing required fields");
  }

  const user = await createUser({ email: params.email, hashedPassword: String(hashedPassword) });

  if (!user) {
    throw new Error("Could not create user");
  }

  respondWithJSON(res, 201, {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  });
}