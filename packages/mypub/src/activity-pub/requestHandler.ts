import { AsyncResult, MyPubContext } from "@mypub/types";
import { Activity, AnyObjectNotString } from "activitypub-zod";
import { z } from "zod";

import { Errors, PublicDestination } from "../constants/index.js";
import { isSingleOfType } from "../utils/activitypub-utils.js";
import {
  parseSignatureHeader,
  verifyDigest,
  verifySignature,
} from "../utils/http-signature.js";
import { isSimpleError } from "../utils/simple-error.js";
import { syncExternalActor } from "./actor.js";

export async function handleRequest<T extends z.ZodType<AnyObjectNotString>>(
  context: MyPubContext,
  request: Request,
  expectedSchema: T,
): AsyncResult<z.TypeOf<T>> {
  const contentType = request.headers.get("content-type");
  const digest = request.headers.get("digest");
  const signature = request.headers.get("signature");

  if (!contentType || !digest || !signature) {
    return { error: Errors.badRequest, reason: "1" };
  }

  if (!contentType.match(/^application\/(activity|ld)\+json($|;)/)) {
    return { error: Errors.badRequest, reason: contentType };
  }

  let body: string;
  let json: unknown;
  try {
    body = await request.text();
    json = JSON.parse(body);
  } catch (error) {
    return { error: Errors.badRequest, reason: error };
  }

  let object: z.TypeOf<typeof expectedSchema>;
  try {
    object = expectedSchema.parse(json);
  } catch (error) {
    return { error: Errors.badRequest, reason: error };
  }

  if (
    isSingleOfType<Activity>(object, "Delete") &&
    object.id?.endsWith("#delete") &&
    typeof object.actor === "string" &&
    typeof object.target === "string" &&
    Array.isArray(object.to) &&
    object.to?.[0] === PublicDestination
  ) {
    return { error: Errors.ignored };
  }

  const signatureHeader = parseSignatureHeader(signature);
  if (isSimpleError(signatureHeader)) {
    return signatureHeader;
  }

  const url = new URL(signatureHeader.keyId);
  const user = await syncExternalActor(context, url.origin + url.pathname);
  if (isSimpleError(user)) {
    return user;
  }

  const validDigest = verifyDigest(digest, body);
  if (isSimpleError(validDigest)) {
    return validDigest;
  }

  const validSignature = verifySignature(
    user.publicKey,
    signatureHeader,
    request,
  );
  if (isSimpleError(validSignature)) {
    return validSignature;
  }

  return object;
}