import { TFunction } from "react-i18next";
import { follow } from "../../util/wrapper/eggs/users";
import { AddCircleOutlineRoundedIcon, CloseRoundedIcon, DoneRoundedIcon, LocationOnRoundedIcon } from "../../util/icons";
import { defaultAvatar, defaultBanner, getUserPage, prefectureLink, SocialMedia } from "../../util/util";
import { UserStub } from "../../util/wrapper/eggshellver/util";
import "./profileBanner.scss";
import "./listModal/modal.scss";
import { eggshellverFollow, getEggshellverFollows } from "../../util/wrapper/eggshellver/follow";
import React, { useEffect, useState } from "react";
import { cache } from "../../util/loadHandler";
import UserStats from "./userStats/userStats";
import browser from "webextension-polyfill";
import { deleteUser, getUsers } from "../../util/wrapper/eggshellver/user";

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
			<dialog
				id="ees-blocked-users-modal"
				className="ees-modal">
				<BlockedUsers t={t} />
			</dialog>
			<dialog
				id="ees-withdraw-modal"
				className="ees-modal">
				<Withdraw t={t} />
			</dialog>
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
					<li><button onClick={() => {showWithdrawPopup();}}>{t("settings.withdrawees")}</button></li>
					<li><button onClick={() => {showBlockedUsers();}}>{t("settings.blocked")}</button></li>
				</ul>
			</dialog>
		</div>
	);
}

function showBlockedUsers() {
	const blockedUsersModal = document.getElementById("ees-blocked-users-modal") as HTMLDialogElement;
	blockedUsersModal?.showModal();
}

function closeWithdrawModal() {
	const modal = document.getElementById("ees-withdraw-modal") as HTMLDialogElement;
	modal?.close();
}

function showWithdrawPopup() {
	const withdrawModal = document.getElementById("ees-withdraw-modal") as HTMLDialogElement;
	withdrawModal?.showModal();
}

function Withdraw(props: {t: TFunction}) {
	const { t } = props;

	return (
		<div className="ees-modal-content">
			<div className="ees-modal-header">
				<h2>{t("settings.withdrawees")}</h2>
				<button
					className="ees-modal-close"
					onClick={() => {closeWithdrawModal();}}>
					<CloseRoundedIcon />
				</button>
			</div>
			<div className="ees-modal-body">
				<p>{t("settings.withdraweesExplain")}</p>
				<div className="ees-modal-buttons">
					<button
						className="ees-modal-button"
						id="ees-withdraw-button"
						type="button"
						onClick={() => {executeDeletion();}}>{t("settings.withdrawees")}</button>
					<button
						className="ees-modal-button"
						id="ees-cancel-withdraw-button"
						type="button"
						onClick={() => {closeWithdrawModal();}}>{t("general.cancel")}</button>
				</div>
			</div>
		</div>
	);
}

async function executeDeletion() {
	await deleteUser();
	browser.storage.sync.remove(["token", "eggshellvertoken", "eggsid", "loginType", "password"]);
	window.location.reload();
}

function BlockedUsers(props: {t:TFunction}) {
	const { t } = props;
	const [blockedUsers, setBlockedUsers] = useState<UserStub[]>([]);
	useEffect(() => {
		browser.storage.sync.get("blockedUsers").then(data => {
			const blockedUsers = data.blockedUsers as string[];
			if (blockedUsers === undefined || blockedUsers.length === 0) return;
			getUsers({ eggsids: blockedUsers }).then(users => {
				setBlockedUsers(users);
			});
		});
	});
	return (
		<div className="ees-modal-content">
			<div className="ees-modal-header">
				<h2>{t("settings.blocked")}</h2>
				<button
					className="ees-modal-close"
					onClick={() => {closeModal();}}>
					<CloseRoundedIcon />
				</button>
			</div>
			<div className="ees-modal-body">
				<ul id="ees-blocked-users">
					{blockedUsers.map(user => <BlockedUser
						key={user.userName}
						t={t}
						user={user}
						setBlockedUsers={setBlockedUsers} />)}
				</ul>
			</div>
		</div>
	);
}

function closeModal() {
	const modal = document.getElementById("ees-blocked-users-modal") as HTMLDialogElement;
	modal?.close();
}

function BlockedUser(props: {t:TFunction, user:UserStub, setBlockedUsers:React.Dispatch<React.SetStateAction<UserStub[]>>}) {
	const { t, user, setBlockedUsers } = props;
	return <li className="ees-blocked-user">
		<a
			className="ees-blocked-user-inner"
			href={getUserPage(user.userName)}>
			<div className="ees-blocked-user-image-wrapper">
				<img
					className="ees-blocked-user-image"
					src={user.imageDataPath || defaultAvatar}
					width={64}
					height={64} />
			</div>
			<div className="ees-blocked-user-details">
				<span className="ees-blocked-user-username">{user.displayName}</span>
				<span className="ees-blocked-user-eggsid">EggsID：{user.userName}</span>
			</div>
			<button
				className="ees-blocked-user-unblock"
				onClick={(e) => {unblockUser(e, user.userName, setBlockedUsers);}}>{t("settings.unblock")}</button>
		</a>
		
	</li>;
}

async function unblockUser(e:React.MouseEvent<HTMLButtonElement, MouseEvent>, userName:string, setBlockedUsers:React.Dispatch<React.SetStateAction<UserStub[]>>) {
	e.preventDefault();
	setBlockedUsers(blockedUsers => {
		const newBlockedUsers = blockedUsers.filter(u => u.userName !== userName);
		browser.storage.sync.set({ blockedUsers: newBlockedUsers });
		return newBlockedUsers;
	});
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
