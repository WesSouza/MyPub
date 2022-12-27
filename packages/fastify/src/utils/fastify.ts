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

export function replyWithResponse(reply: FastifyReply, response: Response) {
  function startReply() {
    reply.code(response.status);
    response.headers.forEach((value, key) => {
      reply.header(key, value);
    });
  }

  if (!response.body) {
    startReply();
    reply.send();
    return;
  }

  response
    .arrayBuffer()
    .then((data) => {
      startReply();
      reply.send(Buffer.from(data));
    })
    .catch((error) => {
      console.error(error);
      reply.code(500);
      reply.send();
    });
}
