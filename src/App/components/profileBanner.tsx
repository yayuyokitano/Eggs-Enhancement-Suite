import { defaultAvatar, defaultBanner, SocialMedia } from "../../util/util";
import { UserStub } from "../../util/wrapper/eggshellver/util";
import "./profileBanner.scss";

export default function ProfileBanner(props:{ user:UserStub, socialMedia?:SocialMedia[] }) {
	const { user, socialMedia } = props;
	const bannerImage = user.imageDataPath || defaultBanner;
	const avatar = user.imageDataPath || defaultAvatar;
	return (
		<div
			id="ees-profile-banner"
			style={{backgroundImage: `url(${bannerImage}`}}>
			<div id="ees-banner-inner">
				<div className="ees-banner-content">
					<a
						href={avatar}
						className="fancybox">
						<img
							id="ees-profile-picture"
							src={avatar}
							alt=""
							height={200}
							width={200} />
					</a>
					
				</div>
				<div className="ees-banner-content ees-banner-user-details">
					<h1>{user.displayName}</h1>
					<span id="ees-eggs-id">EggsID：{user.userName}</span>
					<p id="ees-banner-profile">{user.profile}</p>
				</div>
				<SocialMedia socialMedia={socialMedia} />
			</div>
		</div>
	);
}

function SocialMedia(props:{ socialMedia?:SocialMedia[] }) {
	const { socialMedia } = props;
	if (!socialMedia) return <></>;
	return (
		<div className="ees-banner-content ees-banner-sns">
			{socialMedia.map((media) => (
				<div
					key={media.href}
					className="ees-sns-wrapper">
					<a
						key={media.href}
						href={media.href}
						target="_blank"
						className="ees-sns-link"
						rel="noopener noreferrer">
						{media.title}
					</a>
					<hr />
				</div>
			))}
		</div>
	);
}
