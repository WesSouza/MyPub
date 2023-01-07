import { SimpleError, UserData } from "@mypub/types";
import { Actor } from "activitypub-zod";

import { Errors } from "../constants/index.js";

export function mapActorToUserData(actor: Actor): UserData | SimpleError {
  let idUrl: URL;
  try {
    idUrl = new URL(actor.id);
  } catch (error) {
    return {
      error: Errors.invalidActor,
      reason: error,
    };
  }

  if (
    !actor.preferredUsername ||
    !actor.name ||
    !actor.summary ||
    !actor.publicKey?.publicKeyPem
  ) {
    return {
      error: Errors.invalidActor,
    };
  }

  return {
    url: actor.id,
    handle: actor.preferredUsername,
    domain: idUrl.hostname,
    name: actor.name,
    summary: actor.summary,
    tag: [],
    links: [],
    images: {},
    counts: {
      followers: 0,
      following: 0,
      content: 0,
    },
    flags: {
      local: false,
      manuallyApprovesFollowers: actor.manuallyApprovesFollowers ?? false,
    },
    inboxUrl: actor.inbox ?? undefined,
    publicKey: actor.publicKey?.publicKeyPem,
  };
}
