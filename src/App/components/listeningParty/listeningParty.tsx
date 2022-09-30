import { LocalPlaybackController } from "../../player/playback";
import PlaybackController from "../../player/playbackController";
import React, { useState } from "react";
import { TFunction } from "react-i18next";
import { getEggsID } from "../../../util/util";
import { ChatBubbleRoundedIcon, GroupsRoundedIcon, MusicNoteIcon, SettingsRoundedIcon } from "../../../util/icons";
import "./listeningParty.scss";
import Chat from "./chat";

export default function ListeningParty(props: { t: TFunction, playbackController?: PlaybackController }) {
	const { t, playbackController } = props;

	return (
		<div
			id="ees-listening-party"
			className="ees-bottom-popup-wrapper">
			<button
				type="button"
				id="ees-listening-party-button"
				className={"ees-popout-button"}
				onClick={togglePartyActive}>
				<GroupsRoundedIcon />
			</button>
			<PartyContent
				t={t}
				playbackController={playbackController} />
		</div>
	);
}

function PartyContent(props: { t:TFunction, playbackController?:PlaybackController }) {
	const { t, playbackController } = props;

	const [update, setUpdate] = useState(true);
	playbackController?.on("update", () => {
		setUpdate(!update);
	});

	return (
		<div
			id="ees-listening-party-inner"
			className="ees-popout-inner">
			{playbackController?.isPublic ? (
				<ExistingParty
					t={t}
					playbackController={playbackController} />
			) : (
				<PartyCreator
					t={t}
					playbackController={playbackController} />
			)}
		</div>
	);
}

function PartyCreator(props: { t: TFunction, playbackController?: PlaybackController }) {
	const { t, playbackController } = props;
	return (
		<div id="ees-listening-party-creator">
			<form
				onSubmit={(e) => {
					e.preventDefault();
					getEggsID().then((eggsID) => {
						if (playbackController instanceof LocalPlaybackController) {
							playbackController.publicize((document.getElementById("ees-listening-party-name") as HTMLInputElement)?.value ?? t("listeningParty.defaultName", { name: eggsID }));
						}
					});
				}}>
				<h3>{props.t("listeningParty.create")}</h3>
				<label htmlFor="ees-listening-party-name">{props.t("listeningParty.name")}</label><br />
				<input
					type="text"
					id="ees-listening-party-name"
					placeholder={props.t("listeningParty.namePlaceholder")} /><br />
				<button
					type="submit"
					id="ees-listening-party-create-button"
				>{t("listeningParty.start")}</button>
			</form>
		</div>
	);
}

function ExistingParty(props: { t: TFunction, playbackController?: PlaybackController }) {
	const { t, playbackController } = props;

	const [tab, setTab] = useState<"chat"|"suggestions"|"settings">("chat");

	return (
		<div id="ees-existing-listening-party">
			<h3>{playbackController?.title}</h3>
			<div id="ees-listening-party-tabs">
				<button
					type="button"
					id="ees-listening-party-tab-chat"
					className="ees-listening-party-tab-btn active"
					onClick={() => {setPartyTab("chat", setTab);}}>
					<ChatBubbleRoundedIcon />
				</button>
				<button
					type="button"
					id="ees-listening-party-tab-suggestions"
					className="ees-listening-party-tab-btn"
					onClick={() => {setPartyTab("suggestions", setTab);}}>
					<MusicNoteIcon />
				</button>
				<button
					type="button"
					id="ees-listening-party-tab-settings"
					className="ees-listening-party-tab-btn"
					onClick={() => {setPartyTab("settings", setTab);}}>
					<SettingsRoundedIcon />
				</button>
			</div>
			<div id="ees-listening-party-tab-content">
				<TabContent
					t={t}
					tab={tab}
					playbackController={playbackController} />
			</div>
		</div>
	);
}

function TabContent(props: { t: TFunction, playbackController?: PlaybackController, tab: "chat"|"suggestions"|"settings" }) {
	const { t, playbackController, tab } = props;
	switch(tab) {
	case "chat": {
		return <Chat
			t={t}
			playbackController={playbackController} />;
	}
	case "suggestions": {
		return <></>;
	}
	case "settings": {
		return <></>;
	}
	}
}

function setPartyTab(tab:"chat"|"suggestions"|"settings", setTab:React.Dispatch<React.SetStateAction<"chat"|"suggestions"|"settings">>) {
	for (const tabBtn of document.getElementsByClassName("ees-listening-party-tab-btn") as HTMLCollectionOf<HTMLButtonElement>) {
		tabBtn.classList.remove("active");
	}
	(document.getElementById(`ees-listening-party-tab-${tab}`) as HTMLButtonElement).classList.add("active");
	setTab(tab);
}

function togglePartyActive() {
	const queue = document.getElementById("ees-listening-party") as HTMLDivElement;
	queue.classList.toggle("active");
}
