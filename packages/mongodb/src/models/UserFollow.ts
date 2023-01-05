import { UserFollow } from "@mypub/types";
import mongoose from "mongoose";

const { Schema } = mongoose;

const UserFollowSchema = new Schema<UserFollow>({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  follows: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  state: { type: String, enum: ["following", "pending"], required: true },
});

export const UserFollowModel = mongoose.model("UserFollow", UserFollowSchema);
