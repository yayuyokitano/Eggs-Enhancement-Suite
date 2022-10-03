import { TFunction } from "react-i18next";
import { follow } from "../../util/wrapper/eggs/users";
import { AddCircleOutlineRoundedIcon, DoneRoundedIcon, LocationOnRoundedIcon } from "../../util/icons";
import { defaultAvatar, defaultBanner, prefectureLink, SocialMedia } from "../../util/util";
import { UserStub } from "../../util/wrapper/eggshellver/util";
import "./profileBanner.scss";
import { eggshellverFollow, getEggshellverFollows } from "../../util/wrapper/eggshellver/follow";
import React, { useEffect, useState } from "react";
import { cache } from "../../util/loadHandler";
import UserStats from "./userStats/userStats";

export default function ProfileBanner(props:{ t:TFunction, userStub:UserStub, socialMedia?:SocialMedia[], isSelf:boolean }) {
	const { t, userStub, socialMedia, isSelf } = props;
	const bannerImage = userStub.imageDataPath || defaultBanner;
	const avatar = userStub.imageDataPath || defaultAvatar;
	const [isFollowing, setFollowing] = useState<boolean>();

	useEffect(() => {
		cache.getEggsID().then(id => {
			if (id === undefined || id === userStub.userName) return;
			getEggshellverFollows({
				followerIDs: [id],
				followeeIDs: [userStub.userName],
				limit: 1,
			}).then(f => {
				setFollowing(f.total > 0);
			});
		});
	}, []);

	return (
		<div id="ees-profile-header">
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
						<FollowButton
							userStub={userStub}
							t={t}
							isFollowing={isFollowing}
							setFollowing={setFollowing} />
						<ProfileSettings
							t={t}
							isSelf={isSelf} />
					</div>
					<div className="ees-banner-content ees-banner-user-details">
						<h1>{userStub.displayName}</h1>
						<span id="ees-eggs-id">EggsID：{userStub.userName}</span>
						<PrefectureGenre
							t={t}
							user={userStub} />
						<p id="ees-banner-profile">{userStub.profile}</p>
					</div>
					<SocialMedia socialMedia={socialMedia} />
				</div>
			</div>
			<UserStats
				t={t}
				eggsID={userStub.userName} />
		</div>
	);
}

function ProfileSettings(props:{ t:TFunction, isSelf:boolean }) {
	const { t, isSelf } = props;
	useEffect(() => {
		const controller = new AbortController();
		window.addEventListener("click", forceCloseSettingsClick, {signal: controller.signal});
		window.addEventListener("blur", forceCloseSettingsBlur, {signal: controller.signal});
		return () => {
			controller.abort();
		};
	});

	if (!isSelf) return <></>;
	return (
		<div id="ees-profile-settings">
			<button
				id="ees-profile-settings-button"
				type="button"
				onClick={() => {toggleSettings();}}>{t("settings.settings")}</button>
			<dialog id="ees-profile-settings-menu">
				<ul id="ees-profile-settings-list">
					<li><a href="https://eggs.mu/home/edit_hybrid">{t("settings.profile")}</a></li>
					<li><a href="/home/mail_edit">{t("settings.email")}</a></li>
					<li><a href="/home/change_password">{t("settings.password")}</a></li>
					<li><a href="/home/sns_connect">{t("settings.accountlink")}</a></li>
					<li><a href="/home/withdrawal">{t("settings.withdraw")}</a></li>
				</ul>
			</dialog>
		</div>
	);
}

function forceCloseSettingsClick(e:MouseEvent) {
	const dialog = document.getElementById("ees-profile-settings-menu") as HTMLDialogElement;
	const btn = document.getElementById("ees-profile-settings-button") as HTMLButtonElement;
	if (!dialog || !btn) return;
	if ((e.target as HTMLElement)?.closest("#ees-profile-settings")) return;
	dialog.close();
	btn.classList.remove("ees-profile-settings-button-open");
}

function forceCloseSettingsBlur() {
	const dialog = document.getElementById("ees-profile-settings-menu") as HTMLDialogElement;
	const btn = document.getElementById("ees-profile-settings-button") as HTMLButtonElement;
	if (!dialog || !btn) return;
	dialog.close();
	btn.classList.remove("ees-profile-settings-button-open");
}

function toggleSettings() {
	const dialog = document.getElementById("ees-profile-settings-menu") as HTMLDialogElement;
	const btn = document.getElementById("ees-profile-settings-button") as HTMLButtonElement;
	if (!dialog || !btn) return;
	if (dialog.open) {
		dialog.close();
		btn.classList.remove("ees-profile-settings-button-open");
	} else {
		dialog.show();
		btn.classList.add("ees-profile-settings-button-open");
	}
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

function PrefectureGenre(props:{ t:TFunction, user:UserStub }) {
	const { t, user } = props;
	return (
		<div className="ees-banner-content ees-banner-prefecture-genre">
			{user.prefectureCode !== 0 ? <a
				id="ees-banner-prefecture"
				href={prefectureLink(user.prefectureCode)}>
				<LocationOnRoundedIcon />
				{t(`prefecture.${user.prefectureCode}`)}
			</a> : <></>}
			{
				user.genres?.length ? (
					<div id="ees-banner-genres">
						{
							user.genres.map((genre, i) => (
								<div
									className="ees-genre-wrapper"
									key={genre.title}>
									{i !== 0 && "/"}
									<a href={genre.href}>{t(`genre.${genre.href.split("fg").at(-1)}`)}</a>
								</div>
							))
						}
					</div>
				) : <></>}
		</div>
	);
}

function FollowButton(props:{ isFollowing?:boolean, t:TFunction, userStub:UserStub, setFollowing:React.Dispatch<React.SetStateAction<boolean|undefined>> }) {
	const { isFollowing, t, userStub, setFollowing } = props;
	if (isFollowing === undefined) return <></>;
	return (
		<button
			id="ees-follow-button"
			className={isFollowing ? "ees-following" : ""}
			onClick={() => toggleFollow(userStub, setFollowing)}>
			{isFollowing ? (
				<span>
					<DoneRoundedIcon />
					{t("general.following")}
				</span>
			) : (
				<span>
					<AddCircleOutlineRoundedIcon />
					{t("general.follow")}
				</span>
			)}
		</button>
	);
}

function toggleFollow(userStub:UserStub, setFollowing:React.Dispatch<React.SetStateAction<boolean|undefined>>) {
	if (userStub.isArtist) {
		follow(userStub.userName);
	}
	eggshellverFollow(userStub);
	setFollowing(f => !f);
}
