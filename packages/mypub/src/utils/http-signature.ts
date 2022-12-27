import crypto from "node:crypto";

type SignParams = {
  method: string;
  url: string;
  singedHeaders?: string[];
  headers?: HeadersInit;
  keyId: string;
  privateKey: string;
  body?: string;
};

export function digestAndSign(options: SignParams) {
  const url = new URL(options.url);
  const headers = new Headers(options.headers);
  const singedHeaders = options.singedHeaders ? [...options.singedHeaders] : [];
  const date = headers.get("date") ?? new Date().toUTCString();

  if (!headers.has("date")) {
    headers.set("date", date);
  }

  if (!singedHeaders.includes("date")) {
    singedHeaders.push("date");
  }

  if (!headers.has("host")) {
    headers.set("host", url.hostname);
  }

  if (!singedHeaders.includes("host")) {
    singedHeaders.push("host");
  }

  if (options.body !== undefined) {
    const digest = crypto
      .createHash("sha256")
      .update(options.body, "utf-8")
      .digest("base64");

    headers.set("digest", `SHA-256=${digest}`);

    if (!singedHeaders.includes("digest")) {
      singedHeaders.push("digest");
    }
  }

  const verifiableData = [
    `(request-target): ${options.method.toLowerCase()} ${url.pathname}${
      url.search
    }`,
  ]
    .concat(
      singedHeaders.map(
        (headerKey) => `${headerKey.toLowerCase()}: ${headers.get(headerKey)}`,
      ),
    )
    .join("\n");

  const signer = crypto.createSign("rsa-sha256");
  signer.write(Buffer.from(verifiableData));
  signer.end();

  const signature = signer.sign(
    crypto.createPrivateKey(options.privateKey),
    "base64",
  );

  const signatureHeader = `keyId="${
    options.keyId
  }", headers="(request-target) ${singedHeaders.join(
    " ",
  )}", signature="${signature}"`;

  const digest = headers.get("digest");
  if (digest) {
    return {
      date: date,
      digest,
      signature: signatureHeader,
    };
  }

  return {
    date: date,
    signature: signatureHeader,
  };
}

export function sign(options: Omit<SignParams, "body">) {
  return digestAndSign(options);
}
