import { eggsRequest } from "./request";

export async function login(user:string, password:string) {
	return eggsRequest("auth/auth/login", {
		loginId: user,
		password: password,
		type: "1"
	}, {
		isPostRequest: true,
	}) as Promise<{access_token:string}>;
}