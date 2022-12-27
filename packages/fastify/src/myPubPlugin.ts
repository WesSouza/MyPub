import type {
  FastifyPluginAsync,
  FastifyPluginOptions,
  FastifyTypeProviderDefault,
  RawServerDefault,
} from "fastify";
import fp from "fastify-plugin";
import { MyPub } from "mypub";

import { replyWithResponse, unwrapFastifyRequest } from "./utils/fastify.js";

export function myPubFastify(
  myPub: MyPub,
): FastifyPluginAsync<
  FastifyPluginOptions,
  RawServerDefault,
  FastifyTypeProviderDefault
> {
  return fp(async (fastify) => {
    fastify.get("/.well-known/host-meta", {}, (fastifyRequest, reply) => {
      const request = unwrapFastifyRequest(fastifyRequest);
      const response = myPub.handleHostMeta(request) as Response;
      replyWithResponse(reply, response);
    });
  });
}
