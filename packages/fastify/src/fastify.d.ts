import "fastify";

declare module "fastify" {
  interface FastifyRequest {
    rawBodyString?: string;
  }
}
