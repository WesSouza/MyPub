import { SimpleError } from "@mypub/types";
import crypto from "node:crypto";
import { z } from "zod";

import { Errors } from "../index.js";

export type HttpSignatureKey = {
  keyId: string;
  publicKey: string;
  privateKey?: string;
};

const HttpSignatureHeaderSchema = z.object({
  keyId: z.string().url(),
  algorithm: z.string(),
  headers: z.array(z.string()),
  signature: z.string(),
});

type HttpSignatureHeader = z.infer<typeof HttpSignatureHeaderSchema>;

export function parseSignatureHeader(headerValue?: string):
  | {
      keyId: string;
      algorithm: string;
      headers: string[];
      signature: string;
    }
  | SimpleError {
  if (!headerValue) {
    return {
      error: Errors.invalidSignature,
      reason: `Missing signature header`,
    };
  }

  const expectedHeaders = [
    "(request-target)",
    "content-type",
    "date",
    "digest",
    "host",
  ];
  let foundExpectedHeaders = false;

  const values = headerValue.split(/\s*,\s*/).reduce((object, itemValue) => {
    const [name, quotedValue] = itemValue.split(/\s*=\s*/);
    const value = quotedValue.replace(/(^"|"$)/g, "");
    if (name === "headers") {
      const headers = value.split(/\s+/);
      if (
        expectedHeaders.every((expectedHeader) =>
          headers.includes(expectedHeader),
        )
      ) {
        foundExpectedHeaders = true;
      }
      return {
        ...object,
        [name]: headers.filter(
          (headerName) => headerName !== "(request-target)",
        ),
      };
    }
    return { ...object, [name]: value };
  }, {}) as unknown;

  if (!foundExpectedHeaders) {
    return {
      error: Errors.invalidSignature,
      reason: `Missing expected signed headers`,
    };
  }

  try {
    return HttpSignatureHeaderSchema.parse(values);
  } catch (error) {
    return {
      error: Errors.invalidSignature,
      reason: error,
    };
  }
}

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

export function verifyDigest(
  digest: string,
  bodyText: string,
): true | SimpleError {
  const [algorithm, value] = digest.split(/\s*=\s*/, 2);
  if (!algorithm || !value || algorithm.toLowerCase() !== "sha-256") {
    return {
      error: Errors.invalidSignature,
      reason: `Missing or unsupported digest algorithm ${algorithm}`,
    };
  }

  const expectedDigest = crypto
    .createHash("sha256")
    .update(bodyText, "utf-8")
    .digest("base64")
    // This is wrong, but it works
    .replace(/=+$/, "");

  if (expectedDigest !== value) {
    return {
      error: Errors.invalidSignature,
      reason: `Digest does not match`,
    };
  }

  return true;
}

export function verifySignature(
  publicKey: string,
  signature: HttpSignatureHeader,
  request: Request,
): true | SimpleError {
  const url = new URL(request.url);
  const verifiableData = [
    `(request-target): ${request.method.toLowerCase()} ${url.pathname}${
      url.search
    }`,
  ]
    .concat(
      signature.headers.map(
        (headerKey) =>
          `${headerKey.toLowerCase()}: ${request.headers.get(headerKey)}`,
      ),
    )
    .join("\n");

  const validSignature = crypto.verify(
    "rsa-sha256",
    Buffer.from(verifiableData, "utf-8"),
    crypto.createPublicKey(publicKey),
    Buffer.from(signature.signature, "base64"),
  );

  return validSignature
    ? true
    : {
        error: Errors.invalidSignature,
        reason: `Signature verification failed`,
      };
}
