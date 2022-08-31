import { eggshellverRequest } from "./request";
import { UserStub, StrictUserStub } from "./util";

export const postUserStubs = async(userStubs:UserStub[]) => {
	const treatedUserStubs:StrictUserStub[] = userStubs.map(userStub => {
		const copy = {...userStub};
		delete copy.genres;
		return copy;
	});
	eggshellverRequest("userstubs", treatedUserStubs, {method: "POST"});
};
