import { FastifyReply, FastifyRequest } from "fastify";

export function unwrapFastifyRequest(fastifyRequest: FastifyRequest): Request {
  return new Request(
    `http://${fastifyRequest.headers.host ?? "0.0.0.0"}${fastifyRequest.url}`,
    {
      method: fastifyRequest.method,
      headers: (
        Object.entries(fastifyRequest.headers).filter(
          ([, value]) => value !== undefined,
        ) as [string, string][]
      ).map(([key, value]) =>
        Array.isArray(value) ? [key, value.join(", ")] : [key, value],
      ),
      body: fastifyRequest.raw.read(),
    },
  );
}

export async function replyWithResponse(
  reply: FastifyReply,
  response: Response,
) {
  if (!response.body) {
    return;
  }

  reply.code(response.status);
  response.headers.forEach((value, key) => {
    reply.header(key, value);
  });

  if (
    response.headers.get("content-type")?.startsWith("application/octet-stream")
  ) {
    const data = await response.arrayBuffer();
    return Buffer.from(data);
  }

  const data = await response.text();
  return data;
}
