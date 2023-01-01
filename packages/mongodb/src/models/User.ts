import { User } from "@mypub/types";
import mongoose from "mongoose";

const { Schema } = mongoose;

const UserSchema = new Schema<User>({
  url: { type: String, required: true, unique: true },
  handle: { type: String, required: true },
  domain: { type: String, required: true },
  name: { type: String, required: true },
  summary: { type: String, required: true },
  tag: [{ type: String, required: true }],
  links: [
    {
      name: { type: String, required: true },
      href: { type: String, required: true },
    },
  ],
  images: {
    cover: { type: String },
    profile: { type: String },
  },
  followers: {
    items: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      default: undefined,
    },
    total: { type: Number, required: true },
  },
  following: {
    items: {
      type: [
        {
          user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          state: {
            type: String,
            enum: ["following", "pending"],
            required: true,
          },
        },
      ],
      default: undefined,
    },
    total: { type: Number, required: true },
  },
  content: {
    total: { type: Number, required: true },
  },
  publicKey: { type: String, required: true },
  created: { type: Date, required: true },
  updated: { type: Date, required: true },
});

export const UserModel = mongoose.model("User", UserSchema);
