import { cache } from "../../loadHandler";
import Cacher from "../eggs/cacher";
import { baseURL } from "./util";

export async function eggshellverRequest<Req extends object, Res extends object>(url: string|URL, body:Req, options:{
  method:string,
	cache?:Cacher
}):Promise<Res> {
	const preferredCacher = options?.cache ?? cache;
	const requestOptions = options?.method != "GET" ? {
		method: options.method,
		headers: await preferredCacher.getEggshellverHeaders(),
		body: JSON.stringify(body),
	} : {
		method: "GET",
	};

	const urlStr = typeof url === "string" ? "https" + baseURL + url : url.toString();
  
	// use a cache that allows loading immediately, as sometimes eggs websites loads slow and we can reduce the overhead of the extension
	return preferredCacher.fetch(urlStr, requestOptions);
}