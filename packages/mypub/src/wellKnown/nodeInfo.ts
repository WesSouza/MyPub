import { MyPubContext } from "@mypub/types";

import { Errors } from "../constants/index.js";
import { respondWithError } from "../utils/http-response.js";

export async function nodeInfo(context: MyPubContext) {
  if (!context.instance) {
    return respondWithError("generic", Errors.missingInstance);
  }

  return new Response(
    JSON.stringify({
      links: [
        {
          href: `https://${context.instance.domain}/${context.instance.pathSegments["node-info"]}`,
          rel: "http://nodeinfo.diaspora.software/ns/schema/2.1",
        },
      ],
    }),
    {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
    },
  );
}

export async function nodeInfoData(context: MyPubContext) {
  if (!context.instance) {
    return respondWithError("generic", Errors.missingInstance);
  }

  return new Response(
    JSON.stringify({
      version: "2.1",
      software: {
        name: "mypub",
        // TODO: read from package.json, or another method
        version: "0.0.2",
        repository: "https://github.com/WesSouza/MyPub",
        homepage: "https://github.com/WesSouza/MyPub",
      },
      protocols: ["activitypub"],
      services: { outbound: [], inbound: [] },
      openRegistrations: false,
      usage: { users: {} },
      metadata: {
        nodeDescription: context.instance.description,
        nodeName: context.instance.title,
      },
    }),
    {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
    },
  );
}
