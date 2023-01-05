import { FastifyReply, FastifyRequest } from "fastify";

export function unwrapFastifyRequest(fastifyRequest: FastifyRequest): Request {
  const { body, headers, url, method } = fastifyRequest;
  return new Request(`http://${headers.host ?? "0.0.0.0"}${url}`, {
    method: method,
    headers: (
      Object.entries(headers).filter(([, value]) => value !== undefined) as [
        string,
        string,
      ][]
    ).map(([key, value]) =>
      Array.isArray(value) ? [key, value.join(", ")] : [key, value],
    ),
    body:
      typeof body === "object"
        ? JSON.stringify(body)
        : body === "string"
        ? body
        : null,
  });
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
