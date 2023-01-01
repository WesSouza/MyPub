import { memory } from "@mypub/memory";
import { mongodb } from "@mypub/mongodb";
import { s3 } from "@mypub/s3";
import { singleUser } from "@mypub/single-user";
import { MyPub } from "mypub";

import "dotenv/config.js";

export const myPub = new MyPub({
  instance: {
    domain: process.env.INSTANCE_DOMAIN ?? "",
    title: process.env.INSTANCE_TITLE ?? "",
    description: process.env.INSTANCE_DESCRIPTION ?? "",
    email: process.env.INSTANCE_EMAIL ?? "",
    adminUserId: process.env.INSTANCE_ADMIN_USER_ID ?? "",
  },
  cache: memory(),
  data: mongodb({
    uri: process.env.MONGODB_URI ?? "",
  }),
  storage: s3({
    accessKeyId: process.env.B2_KEY_ID ?? "",
    secretAccessKey: process.env.B2_KEY_SECRET ?? "",
  }),
  users: singleUser({
    userId: process.env.INSTANCE_ADMIN_USER_ID ?? "",
    privateKey: process.env.USER_PRIVATE_KEY?.replace(/\\n/g, "\n") ?? "",
    publicKey: process.env.USER_PUBLIC_KEY?.replace(/\\n/g, "\n") ?? "",
  }),
});
