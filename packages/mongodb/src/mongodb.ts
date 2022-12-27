import { MyPubContext } from "@mypub/types";
import * as mongoose from "mongoose";

export function mongodb({ uri }: { uri: string }) {
  async function connect() {
    if (
      mongoose.connection.readyState === mongoose.ConnectionStates.connected
    ) {
      return;
    }
    await mongoose.connect(uri);
  }

  return function withContext(_: MyPubContext) {
    return {
      getUserData: async () => {
        await connect();
        return {
          error: "Not implemented",
        };
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
