import { useEffect, useState } from "react";
import { TFunction } from "react-i18next";
import { crawlUser } from "../../util/wrapper/eggshellver/user";
import { getPlaylists } from "../../util/wrapper/eggs/playlists";
import { Profile, profile } from "../../util/wrapper/eggs/users";
import { postUserStubs } from "../../util/wrapper/eggshellver/userstub";

export default function Profile(t:TFunction) {
	const userID = location.href.split("/").at(-1);
	const [isLoading, setLoading] = useState(true);
	const [isSelf, setSelf] = useState(false);
	const [user, setUser] = useState<Profile>();
	postUserStubs([crawlUser()]);

	useEffect(() => {
		profile().then((user) => {
			setSelf(user.data.userName === userID);
			if (isSelf) {
				getPlaylists(5).then((playlists) => {
					console.log(playlists);
				});
			}
			setUser(user);
			setLoading(false);
		});
	}, []);

	if (isLoading) return <div>{t("general.loading")}</div>;
	if (!user) return <div>{t("general.error")}</div>;

	return (
		<div id="ees-profile">
			<h1>{user.data.displayName}</h1>
		</div>
	);

  
}
