import { AsyncResult, MyPubContext, User } from "@mypub/types";
import { Activity, ActorSchema, AnyActivity } from "activitypub-zod";
import omit from "lodash/omit.js";

import { Errors } from "../constants/index.js";
import { mapActorToUserData } from "../utils/activitypub-maps.js";
import { respondWithError } from "../utils/http-response.js";
import { isSimpleError } from "../utils/simple-error.js";

export async function actor(
  context: MyPubContext,
  request: Request,
  actorHandle: string,
) {
  if (!context.instance) {
    return respondWithError("generic", Errors.missingInstance);
  }

  if (
    !request.headers
      .get("accept")
      ?.toLowerCase()
      .includes("application/activity+json")
  ) {
    return respondWithError("badRequest", Errors.badRequest);
  }

  const user = await context.data.getUserByHandle(actorHandle);
  if (!user || "error" in user) {
    return respondWithError("notFound", Errors.notFound, user);
  }

  return new Response(
    JSON.stringify({
      "@context": [
        "https://www.w3.org/ns/activitystreams",
        "https://w3id.org/security/v1",
        {
          manuallyApprovesFollowers: "as:manuallyApprovesFollowers",
          toot: "http://joinmastodon.org/ns#",
          featured: {
            "@id": "toot:featured",
            "@type": "@id",
          },
          featuredTags: {
            "@id": "toot:featuredTags",
            "@type": "@id",
          },
          alsoKnownAs: {
            "@id": "as:alsoKnownAs",
            "@type": "@id",
          },
          movedTo: {
            "@id": "as:movedTo",
            "@type": "@id",
          },
          schema: "http://schema.org#",
          PropertyValue: "schema:PropertyValue",
          value: "schema:value",
          discoverable: "toot:discoverable",
          Device: "toot:Device",
          Ed25519Signature: "toot:Ed25519Signature",
          Ed25519Key: "toot:Ed25519Key",
          Curve25519Key: "toot:Curve25519Key",
          EncryptedMessage: "toot:EncryptedMessage",
          publicKeyBase64: "toot:publicKeyBase64",
          deviceId: "toot:deviceId",
          claim: {
            "@type": "@id",
            "@id": "toot:claim",
          },
          fingerprintKey: {
            "@type": "@id",
            "@id": "toot:fingerprintKey",
          },
          identityKey: {
            "@type": "@id",
            "@id": "toot:identityKey",
          },
          devices: {
            "@type": "@id",
            "@id": "toot:devices",
          },
          messageFranking: "toot:messageFranking",
          messageType: "toot:messageType",
          cipherText: "toot:cipherText",
          suspended: "toot:suspended",
          Hashtag: "as:Hashtag",
          focalPoint: {
            "@container": "@list",
            "@id": "toot:focalPoint",
          },
        },
      ],
      id: user.url,
      type: "Person",
      following: `${user.url}/${context.instance.pathSegments.following}`,
      followers: `${user.url}/${context.instance.pathSegments.followers}`,
      inbox: `${user.url}/${context.instance.pathSegments.inbox}`,
      outbox: `${user.url}/${context.instance.pathSegments.outbox}`,
      featured: `${user.url}/collections/featured`,
      featuredTags: `${user.url}/collections/tags`,
      preferredUsername: user.handle,
      name: user.name,
      summary: user.summary,
      url: user.url,
      manuallyApprovesFollowers: false,
      discoverable: true,
      published: user.created.toISOString(),
      devices: `${user.url}/collections/devices`,
      publicKey: {
        id: `${user.url}#main-key`,
        owner: `${user.url}`,
        publicKeyPem: user.publicKey,
      },
      tag: user.tag.map((tag) => ({
        type: "Hashtag",
        href: `https://${context.instance.domain}/tags/${tag}`,
        name: tag,
      })),
      attachment: user.links.map((link) => ({
        type: "PropertyValue",
        name: link.name,
        value: `<a href="${link.href}" target="_blank" rel="nofollow noopener noreferrer me">${link.href}</a>`,
      })),
      endpoints: {
        sharedInbox: `https://${context.instance.domain}/${context.instance.pathSegments["shared-inbox"]}`,
      },
      icon: user.images.profile
        ? {
            type: "Image",
            mediaType: "image/jpeg",
            url: user.images.profile,
          }
        : undefined,
      image: user.images.cover
        ? {
            type: "Image",
            mediaType: "image/jpeg",
            url: user.images.cover,
          }
        : undefined,
    }),
    {
      headers: {
        "Content-Type": "application/activity-json; charset=utf-8",
      },
    },
  );
}

export async function follow(
  context: MyPubContext,
  followerUserId: string,
  followingUrlString: string,
): AsyncResult<boolean> {
  const follower = await context.data.getUser(followerUserId);
  if ("error" in follower) {
    return follower;
  }

  const followingUser = await syncExternalActor(context, followingUrlString);
  if ("error" in followingUser) {
    return followingUser;
  }

  const id = `${follower.url}/${followingUser.handle}@${followingUser.domain}/follow`;

  const update = await context.data.setUserFollowing(
    followerUserId,
    followingUser.id,
    id,
    "pending",
  );
  if (isSimpleError(update)) {
    return update;
  }

  const follow: Activity = {
    "@context": "https://www.w3.org/ns/activitystreams",
    actor: follower.url,
    id,
    object: followingUser.url,
    published: new Date().toISOString(),
    to: followingUser.url,
    type: "Follow",
  };

  const followActionResponse = await postToInbox(
    context,
    follower,
    followingUser,
    follow,
  );
  if (isSimpleError(followActionResponse)) {
    context.data.setUserFollowing(
      followerUserId,
      followingUser.id,
      id,
      "not-following",
    );
    return followActionResponse;
  }

  return true;
}

export async function postToInbox(
  context: MyPubContext,
  from: User,
  to: User,
  object: AnyActivity,
): AsyncResult<boolean> {
  if (!to.inboxUrl) {
    return {
      error: Errors.missingInbox,
    };
  }

  const request = new Request(to.inboxUrl, {
    method: "post",
    headers: {
      "content-type": "application/activity+json",
    },
    body: JSON.stringify(object),
  });

  const signedRequest = await context.users.signRequest(from.id, request);
  if ("error" in signedRequest) {
    return {
      error: Errors.requestSigningError,
      reason: signedRequest,
    };
  }

  const response = await fetch(signedRequest);
  if (response.status >= 300) {
    return false;
  }

  return true;
}

export async function syncExternalActor(
  context: MyPubContext,
  urlString: string,
) {
  let url: URL;
  try {
    url = new URL(urlString);
  } catch (error) {
    return { error: Errors.invalidActorUrl };
  }

  if (url.hostname === context.instance.domain) {
    return context.data.getUserByUrl(urlString);
  }

  const actorResponse = await fetch(url, {
    headers: {
      accept: "application/activity+json",
    },
  });
  const actorData = ActorSchema.parse(await actorResponse.json());
  if (!actorData.name) {
    return { error: Errors.invalidServerResponse };
  }

  const userData = mapActorToUserData(actorData);
  if ("error" in userData) {
    return userData;
  }

  const partialUserData = omit(userData, ["counts"]);

  return context.data.upsertUserByUrl(actorData.id, partialUserData);
}

export async function unfollow(
  context: MyPubContext,
  followerUserId: string,
  followingUrlString: string,
): AsyncResult<boolean> {
  const follower = await context.data.getUser(followerUserId);
  if ("error" in follower) {
    return follower;
  }

  const followingUser = await syncExternalActor(context, followingUrlString);
  if ("error" in followingUser) {
    return followingUser;
  }

  const id = `${follower.url}/${followingUser.handle}@${followingUser.domain}/follow`;

  const update = await context.data.undoUserFollowing(followerUserId, id);
  if (isSimpleError(update)) {
    return update;
  }

  const undo: Activity = {
    "@context": "https://www.w3.org/ns/activitystreams",
    actor: follower.url,
    id: `${id}/undo`,
    object: {
      id,
      type: "Follow",
      to: followingUser.url,
    },
    published: new Date().toISOString(),
    to: followingUser.url,
    type: "Follow",
  };

  const followActionResponse = await postToInbox(
    context,
    follower,
    followingUser,
    undo,
  );
  if (isSimpleError(followActionResponse)) {
    return followActionResponse;
  }

  return true;
}
