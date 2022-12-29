export type ActivityPubPathSegment =
  | "activity"
  | "followers"
  | "following"
  | "inbox"
  | "liked"
  | "outbox"
  | "replies"
  | "sharedInbox"
  | "statuses"
  | "users";

export type ActorCollection =
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
  pathSegments: Record<ActivityPubPathSegment, string>;
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
  instance: Omit<MyPubInstanceData, "pathSegments"> &
    Partial<Pick<MyPubInstanceData, "pathSegments">>;
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

export type User = {
  url: string;
  handle: string;
  domain: string;
  name: string;
  summary: string;
  tag: string[];
  links: { name: string; href: string }[];
  images: {
    cover: string | undefined;
    profile: string | undefined;
  };
  followers: {
    items?: UserReference[];
    total: number;
  };
  following: {
    items?: UserReference[];
    total: number;
  };
  content: {
    total: number;
  };
  created: Date;
  updated: Date;
};

export type UserReference = Pick<
  User,
  | "content"
  | "created"
  | "domain"
  | "handle"
  | "images"
  | "name"
  | "updated"
  | "url"
> & {
  followers: Pick<User["followers"], "total">;
  following: Pick<User["following"], "total">;
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
  getUser: (userId: string) => AsyncResult<User>;
  getUserByUrl: (url: string) => AsyncResult<User>;
  getUserByHandle: (accountHandle: string) => AsyncResult<User>;
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
  getUser: (userId: string) => AsyncResult<User>;
};
