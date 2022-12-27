import type {
  ActorCollection,
  MyPubConfig,
  MyPubContext,
  MyPubInstanceData,
} from "@mypub/types";

import { Errors, ErrorStatuses, ErrorType } from "./constants/Errors.js";

export class MyPub {
  readonly instance: MyPubInstanceData;
  private context: Partial<MyPubContext> = {};

  constructor(config: Readonly<MyPubConfig>) {
    this.instance = {
      ...config.instance,
      pathSegments: config.instance.pathSegments ?? {
        activity: "activity",
        followers: "followers",
        following: "following",
        inbox: "inbox",
        liked: "liked",
        outbox: "outbox",
        replies: "replies",
        sharedInbox: "sharedInbox",
        statuses: "statuses",
        users: "users",
      },
    };

    const outerContext = this.context;
    const context = {} as MyPubContext;
    Object.defineProperty(context, "instance", {
      get() {
        if (!outerContext.instance) {
          throw new Error(`Context was not initialized with instance`);
        }
        return outerContext.instance;
      },
    });
    Object.defineProperty(context, "cache", {
      get() {
        if (!outerContext.cache) {
          throw new Error(`Context was not initialized with cache`);
        }
        return outerContext.cache;
      },
    });
    Object.defineProperty(context, "data", {
      get() {
        if (!outerContext.data) {
          throw new Error(`Context was not initialized with data`);
        }
        return outerContext.data;
      },
    });
    Object.defineProperty(context, "storage", {
      get() {
        if (!outerContext.storage) {
          throw new Error(`Context was not initialized with storage`);
        }
        return outerContext.storage;
      },
    });
    Object.defineProperty(context, "users", {
      get() {
        if (!outerContext.users) {
          throw new Error(`Context was not initialized with users`);
        }
        return outerContext.users;
      },
    });

    this.context.instance = this.instance;
    this.context.cache = config.cache(context);
    this.context.data = config.data(context);
    this.context.storage = config.storage(context);
    this.context.users = config.users(context);
  }

  handleHostMeta = (_: Request) => {
    if (!this.context.instance) {
      return this.respondWithError("generic", Errors.missingInstance);
    }

    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
  <XRD xmlns="http://docs.oasis-open.org/ns/xri/xrd-1.0">
    <Link rel="lrdd" template="https://${this.context.instance?.domain}/.well-known/webfinger?resource={uri}"/>
  </XRD>`,
      {
        headers: {
          "content-type": "application/xrd+xml; charset=utf-8",
        },
      },
    );
  };

  handleWebFinger = (_: Request) => {
    return this.respondWithError("notFound", Errors.X_notImplemented);
  };

  handleActor = (_: Request, _1: { actorHandle?: string }) => {
    return this.respondWithError("notFound", Errors.X_notImplemented);
  };

  handleActorCollection = (
    _: Request,
    _1: { actorHandle: string; collection: ActorCollection },
  ) => {
    return this.respondWithError("notFound", Errors.X_notImplemented);
  };

  handleActorObject = (
    _: Request,
    _1: { actorHandle: string; objectId: string },
  ) => {
    return this.respondWithError("notFound", Errors.X_notImplemented);
  };

  handleInboxPost = (_: Request, _1?: { actorHandle?: string }) => {
    return this.respondWithError("notFound", Errors.X_notImplemented);
  };

  respondWithError = (
    errorType: ErrorType,
    error: keyof typeof Errors,
    reason?: Error,
  ) => {
    console.error(error, reason ?? "");
    return new Response(JSON.stringify({ error }), {
      status: ErrorStatuses[errorType].status,
      statusText: ErrorStatuses[errorType].statusText,
    });
  };
}
