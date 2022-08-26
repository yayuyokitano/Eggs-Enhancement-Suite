import { eggsRoot, getEggsHeaders } from "../../util";

console.log("a");

export async function eggsRequest<Req extends object, Res extends object>(url: string, body:Req, options?:{
  isPostRequest?: boolean,
  isPutRequest?: boolean,
  isAuthorizedRequest?: boolean,
}):Promise<Res> {
	const requestOptions = options?.isPostRequest || options?.isPutRequest ? {
		method: options.isPostRequest ? "POST" : "PUT",
		headers: await getEggsHeaders(options?.isAuthorizedRequest),
		body: JSON.stringify(body),
	} : {
		method: "GET",
		headers: await getEggsHeaders(options?.isAuthorizedRequest),
	};
  
	const res = await fetch(eggsRoot + url, requestOptions);
	if (!res.ok) {
		throw new Error(`${res.status} ${res.statusText}`);
	}
	const resJSON = await res.json();
	if ("code" in resJSON && "message" in resJSON) {
		throw new Error(`${resJSON.code} ${resJSON.message}`);
	}

	return resJSON;
}