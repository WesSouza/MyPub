import type {
  FastifyPluginAsync,
  FastifyPluginOptions,
  FastifyTypeProviderDefault,
  RawServerDefault,
} from "fastify";
import fp from "fastify-plugin";
import {
  ActorCollection,
  ActorCollections,
  Errors,
  MyPub,
  SharedInbox,
} from "mypub";

import { replyWithResponse, unwrapFastifyRequest } from "./utils/fastify.js";

export function myPubFastify(
  myPub: MyPub,
): FastifyPluginAsync<
  FastifyPluginOptions,
  RawServerDefault,
  FastifyTypeProviderDefault
> {
  return fp(async (fastify) => {
    const { pathSegments } = myPub.instance;

    fastify.get("/.well-known/host-meta", {}, (fastifyRequest, reply) => {
      const request = unwrapFastifyRequest(fastifyRequest);
      const response = myPub.handleHostMeta(request);
      replyWithResponse(reply, response);
    });

    fastify.get("/.well-known/webfinger", {}, (fastifyRequest, reply) => {
      const request = unwrapFastifyRequest(fastifyRequest);
      const response = myPub.handleWebFinger(request);
      replyWithResponse(reply, response);
    });

    fastify.get<{ Params: { actorHandle: string } }>(
      `/${pathSegments.users}/:actorHandle`,
      {},
      (fastifyRequest, reply) => {
        const { actorHandle } = fastifyRequest.params;
        const request = unwrapFastifyRequest(fastifyRequest);
        const response = myPub.handleActor(request, {
          actorHandle,
        });
        replyWithResponse(reply, response);
      },
    );

    Object.keys(ActorCollections).forEach((collection) => {
      if (collection === "Inbox" || !(collection in ActorCollections)) {
        return;
      }

      const { path } = ActorCollections[collection as ActorCollection];
      fastify.get<{ Params: { actorHandle: string } }>(
        `/${pathSegments.users}/:actorHandle/${path}`,
        {},
        (fastifyRequest, reply) => {
          const { actorHandle } = fastifyRequest.params;
          const request = unwrapFastifyRequest(fastifyRequest);
          const response = myPub.handleActorCollection(request, {
            actorHandle,
            collection: collection as ActorCollection,
          });
          replyWithResponse(reply, response);
        },
      );
    });

    fastify.get<{ Params: { objectId: string; actorHandle: string } }>(
      `/${pathSegments.users}/:actorHandle/${pathSegments.statuses}/:objectId`,
      {},
      (fastifyRequest, reply) => {
        const { actorHandle, objectId } = fastifyRequest.params;
        const request = unwrapFastifyRequest(fastifyRequest);
        const response = myPub.handleActorObject(request, {
          actorHandle,
          objectId,
        });
        replyWithResponse(reply, response);
      },
    );

    fastify.get<{ Params: { objectId: string; actorHandle: string } }>(
      `/${pathSegments.users}/:actorHandle/${pathSegments.statuses}/:objectId/${pathSegments.activity}`,
      {},
      (fastifyRequest, reply) => {
        const { actorHandle, objectId } = fastifyRequest.params;
        console.log("getActivity", actorHandle, objectId);
        reply.code(404).send({ error: Errors.X_notImplemented });
      },
    );

    fastify.get<{ Params: { objectId: string; actorHandle: string } }>(
      `/${pathSegments.users}/:actorHandle/${pathSegments.statuses}/:objectId/${pathSegments.replies}`,
      {},
      (fastifyRequest, reply) => {
        const { actorHandle, objectId } = fastifyRequest.params;
        console.log("getReplies", actorHandle, objectId);
        reply.code(404).send({ error: Errors.X_notImplemented });
      },
    );

    fastify.post(`/${SharedInbox.path}`, {}, (fastifyRequest, reply) => {
      const request = unwrapFastifyRequest(fastifyRequest);
      const response = myPub.handleInboxPost(request);
      replyWithResponse(reply, response);
    });

    fastify.post<{ Params: { actorHandle: string } }>(
      `/${pathSegments.users}/:actorHandle/${pathSegments.inbox}`,
      {},
      (fastifyRequest, reply) => {
        const { actorHandle } = fastifyRequest.params;
        const request = unwrapFastifyRequest(fastifyRequest);
        const response = myPub.handleInboxPost(request, { actorHandle });
        replyWithResponse(reply, response);
      },
    );
  });
}
