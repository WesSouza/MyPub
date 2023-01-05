import { FastifyReply, FastifyRequest } from "fastify";

import { MyPubFastifyOptions } from "../myPubPlugin.js";

export async function unwrapFastifyRequest(
  fastifyRequest: FastifyRequest,
  options: MyPubFastifyOptions,
): Promise<Request> {
  const { headers, url, method } = fastifyRequest;
  if (
    options.enableXForwardedHost &&
    typeof headers["x-forwarded-host"] === "string"
  ) {
    headers.host = headers["x-forwarded-host"];
    delete headers["x-forwarded-host"];
  }

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
    body: fastifyRequest.rawBodyString ?? null,
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
