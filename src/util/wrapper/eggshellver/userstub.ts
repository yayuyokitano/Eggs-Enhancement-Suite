import { baseURL, UserStub } from "./util";

export async function postUserStubs(userStubs:UserStub[]) {
	return fetch(`${baseURL}userstubs`, {
		method: "POST",
		body: JSON.stringify(userStubs)
	});
}