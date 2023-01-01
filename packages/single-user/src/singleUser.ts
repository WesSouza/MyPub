import {
  AsyncResult,
  MyPubContext,
  MyPubUsersModule,
  UserKeys,
} from "@mypub/types";
import { sign, Errors } from "mypub";

export function singleUser(user: {
  userId: string;
  privateKey: string;
  publicKey: string;
}) {
  let keyId: string | undefined;

  return function withContext(context: MyPubContext): MyPubUsersModule {
    function getUserKeys(userId: string): AsyncResult<UserKeys> {
      if (userId !== user.userId) {
        return Promise.resolve({ error: Errors.notFound });
      }

      return Promise.resolve({
        privateKey: user.privateKey,
        publicKey: user.publicKey,
      });
    }

    async function signRequest(
      userId: string,
      request: Request,
    ): AsyncResult<Request> {
      if (!keyId) {
        const user = await context.data.getUser(userId);
        if ("error" in user) {
          return { error: Errors.notFound, reason: user };
        }
        keyId = `${user.url}#main-key`;
      }

      if (userId !== user.userId) {
        throw new Error(`Unable to sign for user ${userId}: unknown user`);
      }

      return await sign(request, {
        keyId,
        privateKey: user.privateKey,
        publicKey: user.publicKey,
      });
    }

    return {
      getUserKeys,
      signRequest,
    };
  };
}
