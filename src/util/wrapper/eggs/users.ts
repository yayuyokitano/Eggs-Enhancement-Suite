import { eggsRequest } from "./request"

export async function profile() {
  return eggsRequest("users/users/profile", {}, {
    isAuthorizedRequest: true,
  }) as Promise<{data:{
    displayName: string,
  }}>;
}