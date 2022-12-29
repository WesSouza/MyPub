import { AsyncResult, MyPubUsersModule, User } from "@mypub/types";

export function singleUser(_: { privateKey: string; publicKey: string }) {
  function getUser(userId: string): AsyncResult<User> {
    console.log(`getUser ${userId}`);
    throw new Error("Not implemented");
  }

  return function withContext(): MyPubUsersModule {
    return {
      getUser,
    };
  };
}
