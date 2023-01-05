import { AsyncResult, MyPubContext } from "@mypub/types";
import { Activity, ActivitySchema } from "activitypub-zod";
import { Errors } from "../index.js";
import { isSingleOfType } from "../utils/activitypub-utils.js";
import { isSimpleError } from "../utils/simple-error.js";

export async function inboxReceive(
  context: MyPubContext,
  request: Request,
  _1?: string,
): AsyncResult<boolean> {
  // TODO: So much geez, at least make sure this is secure!

  const body = await request.json();
  const activity = ActivitySchema.parse(body);
  console.log(
    request.headers.get("user-agent"),
    request.headers.get("content-type"),
    activity,
  );

  switch (activity.type) {
    case "Accept": {
      const { object } = activity;
      if (!isSingleOfType<Activity>(object, "Follow")) {
        console.log(`Unsupported ${activity.type} object at ${activity.id}`);
        return {
          error: Errors.badRequest,
        };
      }
      if (!("actor" in object) || typeof object.actor !== "string") {
        console.log(`Unsupported ${activity.type} actor at ${activity.id}`);
        return {
          error: Errors.badRequest,
        };
      }
      if (typeof object.object !== "string") {
        console.log(`Unsupported ${activity.type} object at ${activity.id}`);
        return {
          error: Errors.badRequest,
        };
      }
      const user = await context.data.getUserByUrl(object.actor);
      if (isSimpleError(user)) {
        return user;
      }
      const followingUser = await context.data.getUserByUrl(object.object);
      if (isSimpleError(followingUser)) {
        return followingUser;
      }
      return context.data.setUserFollowing(
        user.id,
        followingUser.id,
        "following",
      );
    }
    default: {
      console.log(
        `Unsupported activity type ${activity.type} at ${activity.id}`,
      );
      return {
        error: Errors.unknownError,
      };
    }
  }
}
