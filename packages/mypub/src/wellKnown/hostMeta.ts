import { MyPubContext } from "@mypub/types";

import { Errors } from "../constants/index.js";
import { respondWithError } from "../utils/http-response.js";

export async function hostMeta(context: MyPubContext) {
  if (!context.instance) {
    return respondWithError("generic", Errors.missingInstance);
  }

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
  <XRD xmlns="http://docs.oasis-open.org/ns/xri/xrd-1.0">
    <Link rel="lrdd" template="https://${context.instance?.domain}/.well-known/webfinger?resource={uri}"/>
  </XRD>`,
    {
      headers: {
        "content-type": "application/xrd+xml; charset=utf-8",
      },
    },
  );
}
