import { AsyncResult, MyPubUsersModule, UserKeys } from "@mypub/types";
import { Errors } from "mypub";

export function singleUser(user: {
  userId: string;
  privateKey: string;
  publicKey: string;
}) {
  function getUserKeys(userId: string): AsyncResult<UserKeys> {
    if (userId !== user.userId) {
      return Promise.resolve({ error: Errors.notFound });
    }

    return Promise.resolve({
      privateKey: user.privateKey,
      publicKey: user.publicKey,
    });
  }

  function signRequest(_: string, _1: Request): Request {
    throw new Error("signRequest not implemented");
  }

  return function withContext(): MyPubUsersModule {
    return {
      getUserKeys,
      signRequest,
    };
  };
}
