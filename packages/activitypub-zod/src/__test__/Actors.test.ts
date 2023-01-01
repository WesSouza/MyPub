import { readFile } from "fs/promises";
import { describe, expect, it } from "vitest";

import { ActorSchema } from "../Actors.js";

describe("Actors", () => {
  it("parses https://mastodon.social/users/gargron", async () => {
    const json = await readFile(
      new URL("./fixtures/mastodon-social-user-gargron.json", import.meta.url),
      "utf-8",
    );
    const data = ActorSchema.parse(JSON.parse(json));
    expect(data).toMatchSnapshot();
  });
});
