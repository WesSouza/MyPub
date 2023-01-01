import { ObjectSchema } from "activitypub-zod";
import { AsyncResult, MyPubContext } from "@mypub/types";

import { Errors } from "../constants/index.js";
import { respondWithError } from "../utils/http-response.js";

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
        sharedInbox: `https://${context.instance.domain}/${context.instance.pathSegments.sharedInbox}`,
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

export async function syncExternalActor(urlString: string) {
  let url: URL;
  try {
    url = new URL(urlString);
  } catch (error) {
    return { error: Errors.invalidActorUrl };
  }

  const actorResponse = await fetch(url, {
    headers: {
      accept: "application/activity+json",
    },
  });
  const actorData = ObjectSchema.parse(await actorResponse.json());
  if (
    !actorData ||
    typeof actorData !== "object" ||
    !("inbox" in actorData) ||
    typeof actorData.inbox !== "string" ||
    !("preferredUsername" in actorData) ||
    typeof actorData.preferredUsername !== "string"
  ) {
    return { error: Errors.invalidServerResponse };
  }

  return { error: Errors.X_notImplemented };
}

export async function follow(
  context: MyPubContext,
  userId: string,
  urlString: string,
): AsyncResult<boolean> {
  const follower = await context.data.getUser(userId);
  if ("error" in follower) {
    return follower;
  }

  let url: URL;
  try {
    url = new URL(urlString);
  } catch (error) {
    return { error: Errors.invalidActorUrl };
  }

  const followedActorResponse = await fetch(url, {
    headers: {
      accept: "application/activity+json",
    },
  });
  const followedActorData = (await followedActorResponse.json()) as unknown;
  if (
    !followedActorData ||
    typeof followedActorData !== "object" ||
    !("inbox" in followedActorData) ||
    typeof followedActorData.inbox !== "string" ||
    !("preferredUsername" in followedActorData) ||
    typeof followedActorData.preferredUsername !== "string"
  ) {
    return { error: Errors.invalidServerResponse };
  }

  const followActionRequest = new Request(followedActorData.inbox, {
    method: "post",
    headers: {
      "content-type": "application/activity+json",
    },
    body: JSON.stringify({
      "@context": "https://www.w3.org/ns/activitystreams",
      actor: follower.url,
      id: `${follower.url}/${followedActorData.preferredUsername}@${url.hostname}/follow`,
      object: url.toString(),
      published: new Date().toISOString(),
      to: url.toString(),
      type: "Follow",
    }),
  });

  const followActionSignedRequest = await context.users.signRequest(
    userId,
    followActionRequest,
  );
  if ("error" in followActionSignedRequest) {
    return {
      error: Errors.requestSigningError,
      reason: followActionSignedRequest,
    };
  }

  const followActionResponse = await fetch(followActionSignedRequest);
  if (followActionResponse.status >= 300) {
    return false;
  }

  // ToDo: upsert a user in the db for a followingUserId
  // context.data.setUserFollowing(userId, followingUserId, "pending");

  return true;
}
