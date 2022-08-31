import { defaultAvatar, defaultBanner } from "../../util/util";
import { UserStub } from "../../util/wrapper/eggshellver/util";
import "./profileBanner.scss";

export default function ProfileBanner(props:{ user:UserStub }) {
	const { user } = props;
	const bannerImage = user.imageDataPath || defaultBanner;
	const avatar = user.imageDataPath || defaultAvatar;
	return (
		<div
			id="ees-profile-banner"
			style={{backgroundImage: `url(${bannerImage}`}}>
			<div id="ees-banner-inner">
				<div className="ees-banner-content">
					<img
						id="ees-profile-picture"
						src={avatar}
						alt=""
						height={200}
						width={200} />
				</div>
				<div className="ees-banner-content ees-banner-user-details">
					<h1>{user.displayName}</h1>
					<span id="ees-eggs-id">EggsID：{user.userName}</span>
					<p id="ees-banner-profile">{user.profile}</p>
				</div>
			</div>
		</div>
	);
}