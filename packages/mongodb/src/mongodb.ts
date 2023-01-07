import {
  AsyncResult,
  MyPubContext,
  MyPubDataModule,
  User,
  UserData,
} from "@mypub/types";
import mongoose from "mongoose";
import { Errors } from "mypub";
import { UserModel } from "./models/User.js";
import { UserFollowModel } from "./models/UserFollow.js";
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
    async function acceptedUserFollowing(
      followedUserId: string,
      activityId: string,
    ): AsyncResult<boolean> {
      await connect();
      const { modifiedCount } = await UserFollowModel.updateOne(
        {
          follows: followedUserId,
          activityId,
        },
        { $set: { state: "following" } },
      );
      if (!modifiedCount) {
        return false;
      }

      return true;
    }

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

    async function upsertUserByUrl(
      url: string,
      user: Partial<UserData>,
    ): AsyncResult<User> {
      await connect();
      const result = await UserModel.findOneAndUpdate(
        { url },
        {
          $set: { ...user, updated: new Date() },
          $setOnInsert: {
            counts: {
              followers: 0,
              following: 0,
              content: 0,
            },
            created: new Date(),
          },
        },
        { new: true, upsert: true },
      );
      if (!result) {
        return { error: Errors.databaseError };
      }
      const userObject = result.toObject();
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

    async function rejectUserFollowed(
      followedUserId: string,
      activityId: string,
    ): AsyncResult<boolean> {
      await connect();
      const followedUser = await UserModel.findById(followedUserId);
      if (!followedUser) {
        return { error: Errors.notFound };
      }

      const follow = await UserFollowModel.findOneAndDelete({
        follows: followedUserId,
        activityId,
      });
      if (!follow) {
        return false;
      }

      await followedUser.update({ $inc: { "counts.followers": -1 } });
      await UserModel.updateOne(
        { _id: follow.user._id },
        { $inc: { "counts.following": -1 } },
      );

      return true;
    }

    async function setUserFollowing(
      userId: string,
      followingUserId: string,
      activityId: string,
      state: "following" | "pending" | "not-following",
    ): AsyncResult<boolean> {
      await connect();
      const user = await UserModel.findById(userId);
      if (!user) {
        return { error: Errors.notFound };
      }

      const followingUser = await UserModel.findById(followingUserId);
      if (!followingUser) {
        return { error: Errors.notFound };
      }

      if (state === "not-following") {
        const { deletedCount } = await UserFollowModel.deleteOne({
          user: userId,
          follows: followingUser.id,
        });
        if (!deletedCount) {
          return false;
        }

        await user.update({ $inc: { "counts.following": -1 } });
        await followingUser.update({ $inc: { "counts.followers": -1 } });

        return true;
      }

      const { modifiedCount, upsertedCount } = await UserFollowModel.updateOne(
        {
          user: userId,
          follows: followingUser.id,
        },
        { $set: { state }, $setOnInsert: { activityId } },
        { new: true, upsert: true },
      );

      if (upsertedCount) {
        await user.update({ $inc: { "counts.following": 1 } });
        await followingUser.update({ $inc: { "counts.followers": 1 } });
      }

      return modifiedCount > 0 || upsertedCount > 0;
    }

    async function undoUserFollowing(
      userId: string,
      activityId: string,
    ): AsyncResult<boolean> {
      await connect();
      const user = await UserModel.findById(userId);
      if (!user) {
        return { error: Errors.notFound };
      }

      const follow = await UserFollowModel.findOneAndDelete({
        user: userId,
        activityId,
      });
      if (!follow) {
        return false;
      }

      await user.update({ $inc: { "counts.following": -1 } });
      await UserModel.updateOne(
        { _id: follow.follows._id },
        { $inc: { "counts.followers": -1 } },
      );

      return true;
    }

    return {
      acceptedUserFollowing,
      getUser,
      getUserByHandle,
      getUserByUrl,
      getUserFollowing,
      getUserFollowers,
      rejectUserFollowed,
      setUserFollowing,
      undoUserFollowing,
      upsertUserByUrl,
    };
  };
}
