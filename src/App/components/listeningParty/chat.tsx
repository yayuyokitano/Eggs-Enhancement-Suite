import PlaybackController from "../../player/playbackController";
import { TFunction } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import { SendRoundedIcon } from "../../../util/icons";
import { ChatMessage } from "../../../util/socketConnection";
import { defaultAvatar, getUserPage } from "../../../util/util";
import { navigateSafely } from "../../../util/loadHandler";
import "./chat.scss";

export default function Chat(props: { t: TFunction, playbackController?: PlaybackController }) {
	const { t, playbackController } = props;

	const [update, setUpdate] = useState(true);
	const [scroll, setScroll] = useState(0);
	const [height, setHeight] = useState(0);
	const chatRef = useRef<HTMLDivElement>(null);
	playbackController?.on("updateChat", () => {
		setUpdate(!update);
	});

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
					key={message.timestamp.getMilliseconds().toString() + message.message}
					t={t}
					message={message} />)}
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
		</div>
	);
}

function ChatMessage(props: { t: TFunction, message: ChatMessage }) {
	const { t, message } = props;
	return (
		<div className={`ees-listening-party-chat-message${message.self ? " ees-listening-party-chat-self" : ""}`}>
			<a
				onClick={() => {navigateSafely(getUserPage(message.sender.userName));}}
				className="ees-listening-party-chat-image-container">
				<img
					className="ees-listening-party-chat-image"
					src={message.sender.imageDataPath || defaultAvatar}
					alt="" />
			</a>
			<div className="ees-listening-party-chat-message-content">
				<a
					className="ees-listening-party-chat-message-author"
					onClick={() => {navigateSafely(getUserPage(message.sender.userName));}}
				>
					{message.sender.displayName}
					{message.owner && !message.self ? <span className="ees-listening-party-chat-owner">{t("listeningParty.host")}</span> : ""}
				</a>
				<span className="ees-listening-party-chat-message-text">{message.message}</span>
				<span className="ees-listening-party-chat-message-timestamp">
					{message.timestamp.getHours().toString().padStart(2, "0")}:{message.timestamp.getMinutes().toString().padStart(2, "0")}
				</span>
			</div>
		</div>

	);
}
