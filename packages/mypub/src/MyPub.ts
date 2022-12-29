import type {
  ActorCollection,
  MyPubConfig,
  MyPubInstanceData,
} from "@mypub/types";
import { hostMeta } from "./wellKnown/hostMeta.js";

import { Errors } from "./constants/Errors.js";
import { respondWithError } from "./utils/http-response.js";
import { webFinger } from "./wellKnown/webFinger.js";
import { MyPubContext } from "./MyPubContext.js";

export class MyPub {
  readonly instance: MyPubInstanceData;
  private context: MyPubContext;

  constructor(config: Readonly<MyPubConfig>) {
    this.context = new MyPubContext(config);
    this.instance = this.context.instance;
  }

  handleHostMeta = () => {
    return hostMeta(this.context);
  };

  handleWebFinger = (request: Request) => {
    return webFinger(this.context, request);
  };

  handleActor = (_: Request, _1: { actorHandle?: string }) => {
    return respondWithError("notFound", Errors.X_notImplemented);
  };

  handleActorCollection = (
    _: Request,
    _1: { actorHandle: string; collection: ActorCollection },
  ) => {
    return respondWithError("notFound", Errors.X_notImplemented);
  };

  handleActorObject = (
    _: Request,
    _1: { actorHandle: string; objectId: string },
  ) => {
    return respondWithError("notFound", Errors.X_notImplemented);
  };

  handleInboxPost = (_: Request, _1?: { actorHandle?: string }) => {
    return respondWithError("notFound", Errors.X_notImplemented);
  };
}
