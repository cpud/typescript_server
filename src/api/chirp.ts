import type { Request, Response } from "express";

import { respondWithJSON } from "./json.js";
import { BadRequestError, UserForbiddenError, UserNotAuthenticatedError } from "./errors.js";
import { NewChirp, GetChirp } from "../db/schema.js";
import { createChirp, deleteChirp, getChirp, getChirps } from "../db/queries/chirp.js";
import { NotFoundError } from "./errors.js";
import { getBearerToken, validateJWT } from "../auth.js";
import { config } from "../config.js";

export async function handlerChirpsCreate(req: Request, res: Response) {
  type parameters = {
    body: string;
    userId: string
  };

  const token = getBearerToken(req);

  if (!token) {
    throw new UserNotAuthenticatedError("invalid token");
  }

  const userId = validateJWT(token, config.jwt.secret);
  if (!userId) {
    throw new UserNotAuthenticatedError("invalid token");
  }

  const params: parameters = req.body;

  const maxChirpLength = 140;
  if (params.body.length > maxChirpLength) {
    throw new BadRequestError(
      `Chirp is too long. Max length is ${maxChirpLength}`,
    );
  }

  const words = params.body.split(" ");

  const badWords = ["kerfuffle", "sharbert", "fornax"];
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const loweredWord = word.toLowerCase();
    if (badWords.includes(loweredWord)) {
      words[i] = "****";
    }
  }

  const cleaned = words.join(" ");

  const newChirp: NewChirp = {
    body: cleaned,
    //userId: params.userId,
    userId: userId,
  }

  const chirp = await createChirp(newChirp);

 respondWithJSON(res, 201, {
  id: chirp.id,
  creaetedAt: chirp.createdAt,
  updatedAt: chirp.updatedAt,
  body: chirp.body,
  userId: chirp.userId
 })
}


export async function handlerChirpsGet(req: Request, res: Response) {

  const chirps = await getChirps();
  
  respondWithJSON(res, 200, chirps)

}

export async function handlerChirpGetById(req: Request, res: Response) {
  const { chirpId } = req.params;

  if (typeof chirpId !== "string") {
    throw new BadRequestError("Invalid chirp ID");
  }

  const chirp = await getChirp(chirpId);
  if (!chirp) {
    throw new NotFoundError(`Chirp with chirpId: ${chirpId} not found`);
  }

  respondWithJSON(res, 200, chirp);
}

export async function handlerDeleteChirp(req: Request, res: Response) {
  const { chirpId } = req.params

  if (typeof chirpId !== "string") {
    throw new BadRequestError("Invalid chirp ID");
}

  const token = getBearerToken(req);
  const subject = validateJWT(token, config.jwt.secret);

  const chirp = await getChirp(chirpId);
  if (chirp.userId !== subject) {
    throw new UserForbiddenError("not authorized to delete this chirp");
  }

  const deleted = await deleteChirp(chirpId);

  if (!deleted) {
    throw new NotFoundError("chirp not found");
  }

  respondWithJSON(res, 204, "successfully deleted chirp");
}