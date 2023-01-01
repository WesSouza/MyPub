import crypto from "node:crypto";

export type HttpSignatureKey = {
  keyId: string;
  publicKey: string;
  privateKey?: string;
};

export async function sign(request: Request, key: Required<HttpSignatureKey>) {
  const url = new URL(request.url);
  const singedHeaders = ["date", "digest", "host"];
  const date = request.headers.get("date") ?? new Date().toUTCString();

  if (!request.headers.has("date")) {
    request.headers.set("date", date);
  }

  if (!request.headers.has("host")) {
    request.headers.set("host", url.hostname);
  }

  if (request.body !== null) {
    const clonedRequest = request.clone();
    const bodyText = await clonedRequest.text();
    const digest = crypto
      .createHash("sha256")
      .update(bodyText, "utf-8")
      .digest("base64");

    request.headers.set("digest", `SHA-256=${digest}`);
  }

  const verifiableData = [
    `(request-target): ${request.method.toLowerCase()} ${url.pathname}${
      url.search
    }`,
  ]
    .concat(
      singedHeaders.map(
        (headerKey) =>
          `${headerKey.toLowerCase()}: ${request.headers.get(headerKey)}`,
      ),
    )
    .join("\n");

  const signer = crypto.createSign("rsa-sha256");
  signer.write(Buffer.from(verifiableData));
  signer.end();

  const signature = signer.sign(
    crypto.createPrivateKey(key.privateKey),
    "base64",
  );

  const signatureHeader = `keyId="${
    key.keyId
  }",algorithm=\"rsa-sha256\",headers="(request-target) ${singedHeaders.join(
    " ",
  )}",signature="${signature}"`;
  request.headers.set("signature", signatureHeader);

  return request;
}
