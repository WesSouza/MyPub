/* eslint-disable @typescript-eslint/no-this-alias */
import {
  MyPubCacheModule,
  MyPubConfig,
  MyPubDataModule,
  MyPubInstanceData,
  MyPubStorageModule,
  MyPubUsersModule,
} from "@mypub/types";

export class MyPubContext {
  public instance: MyPubInstanceData;
  public cache: MyPubCacheModule;
  public data: MyPubDataModule;
  public storage: MyPubStorageModule;
  public users: MyPubUsersModule;

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

    const outerContext = this;
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

    this.cache = config.cache(context);
    this.data = config.data(context);
    this.storage = config.storage(context);
    this.users = config.users(context);
  }
}
