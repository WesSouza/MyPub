import { MyPubContext, MyPubDataModule } from "@mypub/types";
import mongoose from "mongoose";
import { Errors } from "mypub";
import { UserModel } from "./models/User.js";
import { withStringId } from "./utils/mongodb.js";

export function mongodb({ uri }: { uri: string }) {
  async function connect() {
    if (
      mongoose.connection?.readyState === mongoose.ConnectionStates.connected
    ) {
      return;
    }
    mongoose.set("strictQuery", true);
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

        const userObject = user.toObject();
        return withStringId(userObject);
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

        const userObject = user.toObject();
        return withStringId(userObject);
      },
      getUserByUrl: async (url: string) => {
        await connect();
        const user = await UserModel.findOne({ url });
        if (!user) {
          return { error: Errors.notFound };
        }

        const userObject = user.toObject();
        return withStringId(userObject);
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
