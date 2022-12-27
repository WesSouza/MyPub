import { AsyncResult, UserData } from "@mypub/types";

export function singleUser(_: { privateKey: string; publicKey: string }) {
  function getUserData(userId: string): AsyncResult<UserData> {
    console.log(`getUserData ${userId}`);
    throw new Error("Not implemented");
  }

  return function withContext() {
    return {
      getUserData,
    };
  };
}
