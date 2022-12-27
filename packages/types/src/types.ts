export type ActorCollections =
  | "Followers"
  | "Following"
  | "Inbox"
  | "Liked"
  | "Outbox";

export type AsyncResult<T> = Promise<T | SimpleError>;

export type APIResult<T> = T | SimpleError;

export type SimpleError = {
  error: string;
  reason?: unknown;
};

export type MyPubInstanceData = {
  domain: string;
  title: string;
  description: string;
  email: string;
  adminUserId: string;
};

export type MyPubContext = {
  instance: MyPubInstanceData;
  cache: MyPubCacheModule;
  data: MyPubDataModule;
  storage: MyPubStorageModule;
  users: MyPubUsersModule;
};

export type ContextWrapped<T> = (context: MyPubContext) => T;

export type MyPubConfig = {
  instance: MyPubContext["instance"];
  cache: ContextWrapped<MyPubCacheModule>;
  data: ContextWrapped<MyPubDataModule>;
  storage: ContextWrapped<MyPubStorageModule>;
  users: ContextWrapped<MyPubUsersModule>;
};

export type MyPubCacheModule = {
  has: (key: string) => boolean | Promise<boolean>;
  get: (key: string) => unknown | Promise<unknown>;
  set: (
    key: string,
    value: unknown,
    options: { expiresIn?: number },
  ) => void | Promise<void>;
};

export type UserData = {
  id: string;
  url: string;
  name: string;
};

export type UserReference = {
  id: string;
  url: string;
};

export type Pagination =
  | {
      page: number;
      pages: number;
    }
  | {
      offset: number;
      limit: number;
    }
  | {
      cursor: string;
    };

export type Collection<T> = {
  items: T[];
  totalItems: number;
};

export type MyPubDataModule = {
  getUserData: (userId: string) => AsyncResult<UserData>;
  getUserFollowing: (
    userId: string,
    page: Pagination,
  ) => AsyncResult<Collection<UserReference>>;
  getUserFollowers: (
    userId: string,
    page: Pagination,
  ) => AsyncResult<Collection<UserReference>>;
};

export type FileData = {
  id: string;
  url: string;
  fileName: string;
  alt: string;
  focusPoint?: [number, number];
  contentType: string;
  width?: number;
  height?: number;
  length?: number;
  preview?: FileData;
};

export type MyPubStorageModule = {
  storeObject: (
    file: Omit<FileData, "id" | "url">,
    userId: string,
  ) => AsyncResult<FileData>;
  deleteObject: (objectId: string) => AsyncResult<void>;
};

export type MyPubUsersModule = {
  getUserData: (userId: string) => AsyncResult<UserData>;
};