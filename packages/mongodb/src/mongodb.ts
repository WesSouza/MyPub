import { AsyncResult, MyPubContext, MyPubDataModule, User } from "@mypub/types";
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
    async function getUser(userId: string): AsyncResult<User> {
      await connect();
      const user = await UserModel.findById(userId);
      if (!user) {
        return { error: Errors.notFound };
      }

      const userObject = user.toObject();
      return withStringId(userObject);
    }

    async function getUserByHandle(accountHandle: string): AsyncResult<User> {
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
    }

    async function getUserByUrl(url: string): AsyncResult<User> {
      await connect();
      const user = await UserModel.findOne({ url });
      if (!user) {
        return { error: Errors.notFound };
      }

      const userObject = user.toObject();
      return withStringId(userObject);
    }

    async function getUserFollowing() {
      await connect();
      return {
        error: "Not implemented",
      };
    }

    async function getUserFollowers() {
      await connect();
      return {
        error: "Not implemented",
      };
    }

    async function setUserFollowing(
      userId: string,
      followingUserId: string,
      state: "following" | "pending" | "not-following",
    ): AsyncResult<boolean> {
      const user = await UserModel.findById(userId);
      if (!user) {
        return { error: Errors.notFound };
      }

      const followingUser = await UserModel.findById(followingUserId);
      if (!followingUser) {
        return { error: Errors.notFound };
      }

      if (state === "not-following") {
        await user.update({
          $pull: { following: { items: { userId: followingUserId } } },
        });

        return true;
      }

      if (user.following.items?.find((user) => user.id === followingUserId)) {
        await UserModel.updateOne(
          { id: userId, following: { items: { userId: followingUserId } } },
          {
            $set: {
              following: { "items.$": { userId: followingUserId, state } },
            },
          },
        );
      } else {
        await user.update({
          $push: { following: { items: { userId: followingUserId, state } } },
        });
      }

      return true;
    }

    return {
      getUser,
      getUserByHandle,
      getUserByUrl,
      getUserFollowing,
      getUserFollowers,
      setUserFollowing,
    };
  };
}
