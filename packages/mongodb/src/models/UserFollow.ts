import { UserFollow } from "@mypub/types";
import mongoose from "mongoose";
import { UserWithoutId } from "./User.js";

const { Schema } = mongoose;

const UserFollowSchema = new Schema<UserFollow<UserWithoutId>>({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  follows: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  activityId: { type: String, required: true },
  state: { type: String, enum: ["following", "pending"], required: true },
});

export const UserFollowModel = mongoose.model("UserFollow", UserFollowSchema);
