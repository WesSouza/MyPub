import { readFile } from "fs/promises";
import { describe, expect, it } from "vitest";

import {
  OrderedCollectionPageSchema,
  OrderedCollectionSchema,
} from "../OrderedCollection.js";

describe("OrderedCollection", () => {
  it("parses https://mastodon.social/users/gargron/outbox", async () => {
    const json = await readFile(
      new URL(
        "./fixtures/mastodon-social-user-gargron-outbox.json",
        import.meta.url,
      ),
      "utf-8",
    );
    const data = OrderedCollectionSchema.parse(JSON.parse(json));
    expect(data).toMatchSnapshot();
  });
});

describe("OrderedCollectionPage", () => {
  it("parses https://mastodon.social/users/gargron/outbox?page=true", async () => {
    const json = await readFile(
      new URL(
        "./fixtures/mastodon-social-user-gargron-outbox-page.json",
        import.meta.url,
      ),
      "utf-8",
    );
    const data = OrderedCollectionPageSchema.parse(JSON.parse(json));
    expect(data).toMatchSnapshot();
  });
});
