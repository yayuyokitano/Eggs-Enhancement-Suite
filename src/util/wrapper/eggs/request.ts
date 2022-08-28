import { cache } from "../../../util/loadHandler";
import Cacher from "./cacher";
import { eggsRoot } from "./util";

export async function eggsRequest<Req extends object, Res extends object>(url: string|URL, body:Req, options?:{
  isPostRequest?: boolean,
  isPutRequest?: boolean,
  isAuthorizedRequest?: boolean,
	cache?:Cacher
}):Promise<Res> {
	const preferredCacher = options?.cache ?? cache;
	const requestOptions = options?.isPostRequest || options?.isPutRequest ? {
		method: options.isPostRequest ? "POST" : "PUT",
		headers: await preferredCacher.getEggsHeaders(options?.isAuthorizedRequest),
		body: JSON.stringify(body),
	} : {
		method: "GET",
		headers: await preferredCacher.getEggsHeaders(options?.isAuthorizedRequest),
	};

	const urlStr = typeof url === "string" ? eggsRoot + url : url.toString();
  
	// use a cache that allows loading immediately, as sometimes eggs websites loads slow and we can reduce the overhead of the extension
	return preferredCacher.fetch(urlStr, requestOptions);
}