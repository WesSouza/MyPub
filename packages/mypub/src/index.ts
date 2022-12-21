class MyPub {
  constructor(_: any) {
    console.log("Coming soon...");
  }
}

export const mypub = {
  withContext(context: Record<string, never>) {
    return new MyPub(context);
  },
};
