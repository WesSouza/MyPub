import type {
  FastifyBodyParser,
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

export type MyPubFastifyOptions = {
  enableXForwardedHost?: boolean;
};

export function myPubFastify(
  myPub: MyPub,
  options: MyPubFastifyOptions = {},
): FastifyPluginAsync<
  FastifyPluginOptions,
  RawServerDefault,
  FastifyTypeProviderDefault
> {
  return fp(async (fastify) => {
    const { pathSegments } = myPub.instance;

    const parseJson: FastifyBodyParser<string> = function parseJson(
      request,
      body,
      done,
    ) {
      try {
        request.rawBodyString = body;
        done(null, JSON.parse(body));
      } catch (error) {
        if (error instanceof Error) {
          // @ts-expect-error
          error.statusCode = 400;
          done(error, undefined);
          return;
        }

        const defaultError = new Error("Bad Request");
        // @ts-expect-error
        defaultError.reason = error;
        // @ts-expect-error
        defaultError.statusCode = 400;
        done(defaultError, undefined);
      }
    };

    fastify.addContentTypeParser(
      "application/activity+json",
      { parseAs: "string" },
      parseJson,
    );

    fastify.addContentTypeParser(
      "application/ld+json",
      { parseAs: "string" },
      parseJson,
    );

    fastify.get("/.well-known/host-meta", {}, async (_, reply) => {
      const response = await myPub.handleHostMeta();
      return replyWithResponse(reply, response);
    });

    fastify.get("/.well-known/webfinger", {}, async (fastifyRequest, reply) => {
      const request = await unwrapFastifyRequest(fastifyRequest, options);
      const response = await myPub.handleWebFinger(request);
      return replyWithResponse(reply, response);
    });

    fastify.get<{ Params: { actorHandle: string } }>(
      `/${pathSegments.users}/:actorHandle`,
      {},
      async (fastifyRequest, reply) => {
        const { actorHandle } = fastifyRequest.params;
        const request = await unwrapFastifyRequest(fastifyRequest, options);
        const response = await myPub.handleActor(request, {
          actorHandle,
        });
        return replyWithResponse(reply, response);
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
        async (fastifyRequest, reply) => {
          const { actorHandle } = fastifyRequest.params;
          const request = await unwrapFastifyRequest(fastifyRequest, options);
          const response = await myPub.handleActorCollection(request, {
            actorHandle,
            collection: collection as ActorCollection,
          });
          return replyWithResponse(reply, response);
        },
      );
    });

    fastify.get<{ Params: { objectId: string; actorHandle: string } }>(
      `/${pathSegments.users}/:actorHandle/${pathSegments.statuses}/:objectId`,
      {},
      async (fastifyRequest, reply) => {
        const { actorHandle, objectId } = fastifyRequest.params;
        const request = await unwrapFastifyRequest(fastifyRequest, options);
        const response = await myPub.handleActorObject(request, {
          actorHandle,
          objectId,
        });
        return replyWithResponse(reply, response);
      },
    );

    fastify.get<{ Params: { objectId: string; actorHandle: string } }>(
      `/${pathSegments.users}/:actorHandle/${pathSegments.statuses}/:objectId/${pathSegments.activity}`,
      {},
      async (fastifyRequest, reply) => {
        const { actorHandle, objectId } = fastifyRequest.params;
        console.log("getActivity", actorHandle, objectId);
        reply.code(404).send({ error: Errors.X_notImplemented });
      },
    );

    fastify.get<{ Params: { objectId: string; actorHandle: string } }>(
      `/${pathSegments.users}/:actorHandle/${pathSegments.statuses}/:objectId/${pathSegments.replies}`,
      {},
      async (fastifyRequest, reply) => {
        const { actorHandle, objectId } = fastifyRequest.params;
        console.log("getReplies", actorHandle, objectId);
        reply.code(404).send({ error: Errors.X_notImplemented });
      },
    );

    fastify.post(`/${SharedInbox.path}`, {}, async (fastifyRequest, reply) => {
      const request = await unwrapFastifyRequest(fastifyRequest, options);
      const response = await myPub.handleInboxPost(request);
      return replyWithResponse(reply, response);
    });

    fastify.post<{ Params: { actorHandle: string } }>(
      `/${pathSegments.users}/:actorHandle/${pathSegments.inbox}`,
      {},
      async (fastifyRequest, reply) => {
        const { actorHandle } = fastifyRequest.params;
        const request = await unwrapFastifyRequest(fastifyRequest, options);
        const response = await myPub.handleInboxPost(request, { actorHandle });
        return replyWithResponse(reply, response);
      },
    );
  });
}
