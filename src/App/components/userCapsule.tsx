import { TFunction } from "react-i18next";
import { defaultAvatar, getArtistPage, getUserPage } from "../../util/util";
import { UserStub } from "../../util/wrapper/eggshellver/util";
import "./userCapsule.scss";

export default function UserCapsule(props:{t:TFunction, user:UserStub}) {
	const { user } = props;
	return (
		<a
			className="ees-user-capsule"
			href={user.isArtist ? getArtistPage(user.userName) : getUserPage(user.userName)}
			style={{backgroundImage: `url(${user.imageDataPath})`}}>
			<div className="ees-user-capsule-inner">
				<div className="ees-user-capsule-image-wrapper">
					<img
						className="ees-user-capsule-image"
						src={user.imageDataPath ?? defaultAvatar}
						alt=""
						width={150}
						height={150} />
				</div>
				<div className="ees-user-capsule-text">
					<h3 className="ees-user-capsule-name">{user.displayName}</h3>
					<span className="ees-user-capsule-introtext">{user.profile}</span>
				</div>
			</div>
		</a>
	);
}