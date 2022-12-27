import type {
  FastifyPluginAsync,
  FastifyPluginOptions,
  FastifyTypeProviderDefault,
  RawServerDefault,
} from "fastify";
import fp from "fastify-plugin";
import { MyPub } from "mypub";

export function myPubFastify(
  myPub: MyPub,
): FastifyPluginAsync<
  FastifyPluginOptions,
  RawServerDefault,
  FastifyTypeProviderDefault
> {
  return fp(async (fastify) => {
    fastify.post("/.well-known/host-meta", {}, (_, reply) => {
      reply.send(myPub.handleHostMeta(new Request("/")));
    });
  });
}
