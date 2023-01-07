import type {
  ActorCollection,
  MyPubConfig,
  MyPubInstanceData,
} from "@mypub/types";

import { actor, follow } from "./activity-pub/actor.js";
import { inboxReceive } from "./activity-pub/inbox.js";
import { Errors } from "./constants/Errors.js";
import { MyPubContext } from "./MyPubContext.js";
import { respondWithError } from "./utils/http-response.js";
import { isSimpleError } from "./utils/simple-error.js";
import { hostMeta } from "./wellKnown/hostMeta.js";
import { nodeInfo, nodeInfoData } from "./wellKnown/nodeInfo.js";
import { webFinger } from "./wellKnown/webFinger.js";

export class MyPub {
  readonly instance: MyPubInstanceData;
  private context: MyPubContext;

  constructor(config: Readonly<MyPubConfig>) {
    this.context = new MyPubContext(config);
    this.instance = this.context.instance;
  }

  followActor = (userId: string, url: string) => {
    return follow(this.context, userId, url);
  };

  handleHostMeta = () => {
    return hostMeta(this.context);
  };

  handleWebFinger = (request: Request) => {
    return webFinger(this.context, request);
  };

  handleNodeInfo = () => {
    return nodeInfo(this.context);
  };

  handleNodeInfoData = () => {
    return nodeInfoData(this.context);
  };

  handleActor = (
    request: Request,
    { actorHandle }: { actorHandle?: string },
  ) => {
    if (!actorHandle) {
      return respondWithError("notFound", Errors.notFound);
    }

    return actor(this.context, request, actorHandle);
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

  handleInboxPost = async (
    request: Request,
    { actorHandle }: { actorHandle?: string } = {},
  ) => {
    const result = await inboxReceive(this.context, request, actorHandle);
    if (isSimpleError(result)) {
      return respondWithError("notFound", result.error);
    }

    return new Response(undefined, { status: 200 });
  };
}
