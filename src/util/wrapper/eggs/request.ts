import { eggsRoot, getEggsHeaders } from "../../util";

export async function eggsRequest(url: string, body: {[key:string]:any}, options?:{
  isPostRequest?: boolean,
  isAuthorizedRequest?: boolean,
}):Promise<{[key:string]:any}> {

  const requestOptions = options?.isPostRequest ? {
    method: "POST",
    headers: await getEggsHeaders(options?.isAuthorizedRequest),
    body: JSON.stringify(body),
  } : {
    method: "GET",
    headers: await getEggsHeaders(options?.isAuthorizedRequest),
  }
  
  return (await fetch(eggsRoot + url, requestOptions)).json();
}