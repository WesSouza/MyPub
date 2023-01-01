import { myPub } from "./myPub.js";

const [, , url] = process.argv;

console.log(`Following ${url}`);

const result = await myPub.followActor(myPub.instance.adminUserId, url);
if (result && typeof result === "object" && "error" in result) {
  console.error(result);
} else {
  console.log(result);
}
