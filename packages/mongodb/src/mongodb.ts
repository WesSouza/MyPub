import { MyPubContext, MyPubDataModule } from "@mypub/types";
import mongoose from "mongoose";
import { Errors } from "mypub";
import { UserModel } from "./models/User.js";

export function mongodb({ uri }: { uri: string }) {
  async function connect() {
    if (
      mongoose.connection?.readyState === mongoose.ConnectionStates.connected
    ) {
      return;
    }
    await mongoose.connect(uri);
  }

  return function withContext(context: MyPubContext): MyPubDataModule {
    return {
      getUser: async (userId: string) => {
        await connect();
        const user = await UserModel.findById(userId);
        if (!user) {
          return { error: Errors.notFound };
        }

        return user.toObject();
      },
      getUserByHandle: async (accountHandle: string) => {
        await connect();
        if (!context.instance) {
          return { error: Errors.missingInstance };
        }

        const user = await UserModel.findOne({
          domain: context.instance.domain,
          handle: accountHandle,
        });
        if (!user) {
          return { error: Errors.notFound };
        }

        return user.toObject();
      },
      getUserByUrl: async (url: string) => {
        await connect();
        const user = await UserModel.findOne({ url });
        if (!user) {
          return { error: Errors.notFound };
        }

        return user.toObject();
      },
      getUserFollowing: async () => {
        await connect();
        return {
          error: "Not implemented",
        };
      },
      getUserFollowers: async () => {
        await connect();
        return {
          error: "Not implemented",
        };
      },
    };
  };
}
