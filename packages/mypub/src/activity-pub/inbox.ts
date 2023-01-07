import { AsyncResult, MyPubContext } from "@mypub/types";
import { Activity, ActivitySchema } from "activitypub-zod";

import { Errors } from "../index.js";
import { isSingleOfType } from "../utils/activitypub-utils.js";
import { isSimpleError } from "../utils/simple-error.js";
import { postToInbox, syncExternalActor } from "./actor.js";
import { handleRequest } from "./requestHandler.js";

export async function inboxReceive(
  context: MyPubContext,
  request: Request,
  _1?: string,
): AsyncResult<boolean> {
  const activity = await handleRequest(context, request, ActivitySchema);
  if (isSimpleError(activity)) {
    if (activity.error === Errors.ignored) {
      return true;
    }

    console.error({
      request: `${request.method} ${request.url} ${
        request.headers.get("user-agent") ?? ""
      }`,
      error: activity,
    });
    return activity;
  }

  switch (activity.type) {
    case "Accept": {
      const { actor, object } = activity;
      if (typeof actor !== "string") {
        return {
          error: Errors.badRequest,
          reason: "`actor` is unsupported",
        };
      }
      if (!isSingleOfType<Activity>(object, "Follow")) {
        return {
          error: Errors.badRequest,
          reason: "`object` is unsupported",
        };
      }
      if (typeof object.id !== "string") {
        return {
          error: Errors.badRequest,
          reason: "`object.id` is unsupported",
        };
      }

      const followedUser = await syncExternalActor(context, actor);
      if (isSimpleError(followedUser)) {
        return followedUser;
      }

      return context.data.acceptedUserFollowing(followedUser.id, object.id);
    }

    case "Follow": {
      const { actor, id, object } = activity;
      if (typeof id !== "string") {
        return {
          error: Errors.badRequest,
          reason: "`id` is unsupported",
        };
      }
      if (typeof actor !== "string") {
        return {
          error: Errors.badRequest,
          reason: "`actor` is unsupported",
        };
      }
      if (typeof object !== "string") {
        return {
          error: Errors.badRequest,
          reason: "`object` is unsupported",
        };
      }

      const followerUser = await syncExternalActor(context, actor);
      if (isSimpleError(followerUser)) {
        return followerUser;
      }

      const followedUser = await context.data.getUserByUrl(object);
      if (isSimpleError(followedUser)) {
        return followedUser;
      }
      if (!followedUser.flags.local) {
        return {
          error: Errors.ignored,
          reason: "We don't care",
        };
      }

      const { manuallyApprovesFollowers } = followedUser.flags;

      const update = await context.data.setUserFollowing(
        followerUser.id,
        followedUser.id,
        id,
        manuallyApprovesFollowers ? "pending" : "following",
      );
      if (isSimpleError(update)) {
        return update;
      }

      if (manuallyApprovesFollowers) {
        // TODO: Notify client about an incoming follow request
        return true;
      }

      const accept: Activity = {
        "@context": "https://www.w3.org/ns/activitystreams",
        actor: followedUser.url,
        id: `${followedUser.url}/${followerUser.handle}@${followerUser.domain}/follow`,
        object: activity,
        published: new Date().toISOString(),
        to: followerUser.url,
        type: "Accept",
      };

      const acceptPost = await postToInbox(
        context,
        followedUser,
        followerUser,
        accept,
      );
      if (isSimpleError(acceptPost)) {
        context.data.setUserFollowing(
          followerUser.id,
          followedUser.id,
          id,
          "not-following",
        );
      }

      return acceptPost;
    }

    case "Reject": {
      const { actor, object } = activity;
      if (typeof actor !== "string") {
        return {
          error: Errors.badRequest,
          reason: "`actor` is unsupported",
        };
      }
      if (!isSingleOfType<Activity>(object, "Follow")) {
        return {
          error: Errors.badRequest,
          reason: "`object` is unsupported",
        };
      }
      if (typeof object.id !== "string") {
        return {
          error: Errors.badRequest,
          reason: "`object.id` is unsupported",
        };
      }

      const followedUser = await syncExternalActor(context, actor);
      if (isSimpleError(followedUser)) {
        return followedUser;
      }

      return context.data.rejectUserFollowed(followedUser.id, object.id);
    }

    case "Undo": {
      const { actor, object } = activity;
      if (typeof actor !== "string") {
        return {
          error: Errors.badRequest,
          reason: "`actor` is unsupported",
        };
      }
      if (!isSingleOfType<Activity>(object, "Follow")) {
        return {
          error: Errors.badRequest,
          reason: "`object` is unsupported",
        };
      }
      if (typeof object.id !== "string") {
        return {
          error: Errors.badRequest,
          reason: "`object.id` is unsupported",
        };
      }

      const followerUser = await syncExternalActor(context, actor);
      if (isSimpleError(followerUser)) {
        return followerUser;
      }

      return context.data.undoUserFollowing(followerUser.id, object.id);
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
