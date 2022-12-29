import { MyPubContext, SimpleError, User } from "@mypub/types";

import { Errors, HandleRegExpSingle } from "../constants/index.js";
import { respondWithError } from "../utils/http-response.js";

export async function webFinger(context: MyPubContext, request: Request) {
  if (!context.instance) {
    return respondWithError("generic", Errors.missingInstance);
  }

  if (
    !request.headers
      .get("accept")
      ?.toLowerCase()
      .includes("application/jrd+json")
  ) {
    return respondWithError("badRequest", Errors.badRequest);
  }

  const url = new URL(request.url);
  const resource = url.searchParams.get("resource");
  if (!resource) {
    return respondWithError("badRequest", Errors.badRequest);
  }

  let user: User | SimpleError;
  if (resource.startsWith("acct:")) {
    const email = resource.replace(/^acct:/, "").match(HandleRegExpSingle);
    if (!email || !email.groups?.handle) {
      return respondWithError("badRequest", Errors.badRequest);
    }
    user = await context.data.getUserByHandle(email.groups.handle);
  } else if (resource.startsWith("https://")) {
    user = await context.data.getUserByUrl(resource);
  } else {
    return respondWithError("notFound", Errors.notFound);
  }

  if (!user || "error" in user) {
    return respondWithError("notFound", Errors.notFound, user);
  }

  return new Response(
    JSON.stringify({
      subject: `acct:${user.handle}@${user.domain}`,
      aliases: [user.url],
      links: [
        {
          rel: "self",
          type: "application/activity+json",
          href: user.url,
        },
      ],
    }),
    {
      headers: {
        "Content-Type": "application/jrd+json; charset=utf-8",
      },
    },
  );
}
