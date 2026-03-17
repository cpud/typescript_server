import type { Request, Response } from "express";

import { createUser, getUserByEmail, updateUserEmailPassword } from "../db/queries/users.js";
import { BadRequestError, UserNotAuthenticatedError } from "./errors.js";
import { respondWithJSON } from "./json.js";
import { hashPassword, checkPasswordHash, validateJWT } from "../auth.js";
import { NewUser } from "../db/schema.js";
import { hash } from "node:crypto";
import { check } from "drizzle-orm/gel-core/checks.js";
import { getBearerToken } from "../auth.js";
import { userForRefreshToken } from "../db/queries/refresh.js";
import { config } from "../config.js";

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

export async function handlerUpdateEmailPassword(req: Request, res: Response) {

  type parameters = {
    email: string;
    password: string;
  };


  const token = getBearerToken(req);
  const subject = validateJWT(token, config.jwt.secret); // user id

  const params: parameters = req.body;
  if (!params.email) {
    throw new BadRequestError("missing required field");
  }
  if (!params.password) {
    throw new BadRequestError("missing required field")
  }

  const hashedPassword = await hashPassword(params.password);
  const update = await updateUserEmailPassword(subject, params.email, hashedPassword);

  respondWithJSON(res, 200, {
    id: update.id,
    email: update.email,
    createdAt: update.createdAt,
    updatedAt: update.updatedAt
  });

}