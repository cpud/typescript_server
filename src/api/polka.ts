import { Request, Response } from "express";
import { respondWithJSON } from "./json.js";
import { makeUserRedById } from "../db/queries/users.js";
import { NotFoundError, UserNotAuthenticatedError } from "./errors.js";
import { getAPIKey } from "../auth.js";
import { config } from "../config.js";



export async function handlerPolkaRed(req: Request, res: Response) {

    const apiKey = getAPIKey(req);
    if (apiKey !== config.api.polkaKey) {
        throw new UserNotAuthenticatedError("invalid api key");
    }

    type parameters = {
        event: string,
        data: {
            userId: string
        }
    }

    const params: parameters = req.body;
    if (params.event !== "user.upgraded") {
        respondWithJSON(res, 204, "invalid event")
    }

    if (params.event === "user.upgraded") {
        const result = await makeUserRedById(params.data.userId);
        if (!result) {
            throw new NotFoundError("userid not found")
        } else {
            respondWithJSON(res,204,{});
        }
    }
}