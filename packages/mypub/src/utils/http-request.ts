import { APIResult } from "@mypub/types";

export async function http<T>({
  accept = "application/json",
  jsonBody,
  method = "get",
  redirect = "follow",
  searchParams,
  signal,
  timeout,
  url: urlString,
}: {
  accept?: string;
  jsonBody?: Record<string, any>;
  method?: "get" | "post" | "delete";
  redirect?: RequestInit["redirect"];
  searchParams?: Record<string, string>;
  signal?: AbortSignal | undefined;
  timeout?: number;
  url: string;
}): Promise<APIResult<T>> {
  if (searchParams) {
    const url = new URL(urlString);
    const newSearchParams = new URLSearchParams(searchParams);
    url.search += `&${newSearchParams.toString()}`;
    urlString = url.toString();
  }

  let body = null;
  const headers = new Headers({
    accept,
  });

  if (jsonBody) {
    headers.set("content-type", "application/json");
    body = JSON.stringify(jsonBody);
  }

  if (timeout && signal) {
    console.warn("Cannot combine a timeout and a signal");
  }

  if (timeout && !signal) {
    signal = AbortSignal.timeout(timeout);
  }

  let response;
  try {
    response = await fetch(urlString, {
      body,
      credentials: "same-origin",
      headers,
      method,
      redirect,
      signal,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        return { error: "aborted" };
      }
      if (error.name === "TimeoutError") {
        return { error: "timedOut" };
      }
    }
    return { error: "requestError", reason: String(error) };
  }

  if (!response.headers.get("content-type")?.startsWith(accept)) {
    return { error: "unsupportedContentType" };
  }

  let data: T | undefined;
  let error: string | undefined;

  switch (true) {
    case response.status >= 500:
      error = "serverError";
      break;
    case response.status === 400:
      error = "badRequest";
      break;
    case response.status === 401:
      error = "unauthorized";
      break;
    case response.status === 403:
      error = "forbidden";
      break;
    case response.status === 404:
      error = "notFound";
      break;
    case response.status >= 400:
      error = "clientError";
      break;
    case response.status >= 300:
      error = "redirectionResponse";
      break;
    case response.status < 200:
      error = "informationalResponse";
      break;
  }

  if (!response.headers.get("content-type")?.startsWith(accept)) {
    return { error: error ?? "unsupportedContentType" };
  }

  try {
    data = (await response.json()) as T;
    if (error) {
      return { error, reason: data };
    }
  } catch (error) {
    return { error: "jsonParseError", reason: error };
  }

  return data;
}
