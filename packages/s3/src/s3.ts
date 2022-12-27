import { AsyncResult, FileData } from "@mypub/types";

export function s3(_: { accessKeyId: string; secretAccessKey: string }) {
  function storeObject(
    file: Omit<FileData, "id" | "url">,
    userId: string,
  ): AsyncResult<FileData> {
    console.log(`storeObject ${file.fileName} from ${userId}`);
    throw new Error(`Not implemented`);
  }

  function deleteObject(objectId: string): AsyncResult<void> {
    console.log(`deleteObject ${objectId}`);
    throw new Error(`Not implemented`);
  }

  return function withContext() {
    return {
      storeObject,
      deleteObject,
    };
  };
}
