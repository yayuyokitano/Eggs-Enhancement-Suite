import PlaybackController from "../../player/playbackController";
import { TFunction } from "react-i18next";
import React, { useEffect, useRef, useState } from "react";
import { SendRoundedIcon } from "../../../util/icons";
import { ChatMessage } from "../../../util/socketConnection";
import { defaultAvatar, getEggsID, getUserPage } from "../../../util/util";
import { navigateSafely } from "../../../util/loadHandler";
import "./chat.scss";
import { UserStub } from "../../../util/wrapper/eggshellver/util";

export default function Chat(props: { t: TFunction, playbackController?: PlaybackController }) {
	const { t, playbackController } = props;

	const [update, setUpdate] = useState(true);
	const [scroll, setScroll] = useState(0);
	const [height, setHeight] = useState(0);
	const [selectedUser, setUser] = useState<UserStub | null>(null);
	const [menuVisible, setMenuVisible] = useState(false);
	const chatRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const controller = new AbortController();
		document.addEventListener("click", (e) => {
			const target = e.target as HTMLElement | null;
			if (target?.closest(".ees-chat-btn")) return;
			setMenuVisible(false);
		}, {signal: controller.signal});
		window.addEventListener("blur", () => {
			setMenuVisible(false);
		}, {signal: controller.signal});

		const listener = () => {
			setUpdate(u => !u);
		};

		playbackController?.on("updateChat", listener);
		return () => {
			controller.abort();
			playbackController?.off("updateChat", listener);
		};
	}, []);

	useEffect(() => {
		if (chatRef.current === null) {
			return;
		}
		
		if (scroll < height - 10) {
			setScroll(chatRef.current.scrollTop + chatRef.current.clientHeight);
			setHeight(chatRef.current.scrollHeight);
			return;
		}
		setHeight(chatRef.current.scrollHeight);
		chatRef.current.scrollTop = chatRef.current.scrollHeight - chatRef.current.clientHeight;
		setScroll(chatRef.current.scrollTop + chatRef.current.clientHeight);
	}, [update]);

	return (
		<div id="ees-listening-party-chat">
			<div
				id="ees-listening-party-chat-log"
				ref={chatRef}
				onScroll={(e) => {
					setScroll(e.currentTarget.scrollTop + e.currentTarget.clientHeight);
				}}
			>
				{playbackController?.chatMessages?.map((message) => <ChatMessage
					key={Number(message.timestamp).toString() + message.message}
					t={t}
					message={message}
					setUser={setUser}
					setMenuVisible={setMenuVisible} />)}
			</div>
			<form
				id="ees-listening-party-chat-input"
				onSubmit={(e) => {
					e.preventDefault();
					const inputElement = (document.getElementById("ees-listening-party-chat-input-field") as HTMLInputElement);
					if (!inputElement || !inputElement.value) {
						return;
					}
					playbackController?.sendChatMessage(inputElement.value);
					inputElement.value = "";
				}}>
				<input
					type="text"
					id="ees-listening-party-chat-input-field"
					autoComplete="off"
					placeholder={t("listeningParty.chatPlaceholder")}
				/>
				<button
					type="submit"
					id="ees-listening-party-chat-input-send"
				>
					<SendRoundedIcon />
				</button>
			</form>
			<ContextMenu
				t={t}
				user={selectedUser}
				isVisible={menuVisible}
				playbackController={playbackController} />
			<div id="ees-chat-fixed-checker"></div>
		</div>
	);
}

function ChatMessage(props: { t: TFunction, message: ChatMessage, setUser:React.Dispatch<React.SetStateAction<UserStub|null>>, setMenuVisible:React.Dispatch<React.SetStateAction<boolean>> }) {
	const { t, message, setUser, setMenuVisible } = props;
	return (
		<button
			className={`ees-chat-btn ees-listening-party-chat-message${message.self ? " ees-listening-party-chat-self" : ""}`}
			onClick={() => { setUser(message.sender); setMenuVisible(true); }}>
			<div className="ees-listening-party-chat-image-container">
				<img
					className="ees-listening-party-chat-image"
					src={message.sender.imageDataPath || defaultAvatar}
					alt="" />
			</div>
			<div className="ees-listening-party-chat-message-content">
				<span className="ees-listening-party-chat-message-author">
					{message.sender.displayName}
					{message.owner && !message.self ? <span className="ees-listening-party-chat-owner">{t("listeningParty.host")}</span> : ""}
				</span>
				<span className="ees-listening-party-chat-message-text">{message.message}</span>
				<span className="ees-listening-party-chat-message-timestamp">
					{message.timestamp.getHours().toString().padStart(2, "0")}:{message.timestamp.getMinutes().toString().padStart(2, "0")}
				</span>
			</div>
		</button>

	);
}

function ContextMenu(props: { t: TFunction, user?: UserStub|null, isVisible: boolean, playbackController?: PlaybackController }) {
	const { t, user, isVisible, playbackController } = props;
	const [left, setLeft] = useState(0);
	const [top, setTop] = useState(0);
	const [self, setSelf] = useState("");

	useEffect(() => {
		getEggsID().then((id) => {
			if (!id) return;
			setSelf(id);
		});

		const controller = new AbortController();
		window.addEventListener("click", (e) => {
			const checker = document.getElementById("ees-chat-fixed-checker") as HTMLDivElement | null;
			if (checker === null) return;
			setLeft(e.clientX);
			setTop(e.clientY - checker.getBoundingClientRect().top - 1);
		}, { signal: controller.signal });
		return () => { controller.abort(); };
	}, []);

	if (!user) return <ul className={`ees-chat-context-menu${isVisible ? " ees-chat-context-menu-visible" : ""}`}><li>{t("general.error")}</li></ul>;

	return (
		<ul
			className={`ees-chat-context-menu${isVisible ? " ees-chat-context-menu-visible" : ""}`}
			style={{left: left, top: top}}>
			<li onClick={() => { navigateSafely(getUserPage(user.userName)); }}>{t("listeningParty.viewProfile")}</li>
			{user.userName !== self && <li onClick={() => { playbackController?.blockUser(user.userName); }}>{t("listeningParty.blockUser")}</li>}
		</ul>
	);
}
