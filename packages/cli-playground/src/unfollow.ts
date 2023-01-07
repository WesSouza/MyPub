import { myPub } from "./myPub.js";

const [, , url] = process.argv;

console.log(`Unfollowing ${url}`);

myPub
  .unfollowActor(myPub.instance.adminUserId, url)
  .then((result) => {
    if (result && typeof result === "object" && "error" in result) {
      console.error(result);
    } else {
      console.log(result);
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
