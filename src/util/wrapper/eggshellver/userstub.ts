import { eggshellverRequest } from "./request";
import { UserStub } from "./util";

export const postUserStubs = async(userStubs:UserStub[]) => eggshellverRequest("userstubs", userStubs, {method: "POST"});
