import { LocalPlaybackController } from "../../player/playback";
import PlaybackController from "../../player/playbackController";
import { useEffect, useState } from "react";
import { TFunction } from "react-i18next";
import { getEggsID } from "../../../util/util";
import { GroupsRoundedIcon } from "../../../util/icons";
import "./listeningParty.scss";

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

	const [update, SetUpdate] = useState(true);
	playbackController?.on("update", () => {
		SetUpdate(!update);
	});

	useEffect(() => {
		console.log("updated");
		console.log(playbackController?.title);
	}, [update]);

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
			<h3>{props.t("listeningParty.create")}</h3>
			<label htmlFor="ees-listening-party-name">{props.t("listeningParty.name")}</label><br />
			<input
				type="text"
				id="ees-listening-party-name"
				placeholder={props.t("listeningParty.namePlaceholder")} /><br />
			<button
				type="button"
				id="ees-listening-party-create-button"
				onClick={async() => {
					if (playbackController instanceof LocalPlaybackController) {
						playbackController.publicize((document.getElementById("ees-listening-party-name") as HTMLInputElement)?.value ?? t("listeningParty.defaultName", { name: await getEggsID() }));
					}
				}}>{t("listeningParty.start")}</button>
		</div>
	);
}

function ExistingParty(props: { t: TFunction, playbackController?: PlaybackController }) {
	const { t, playbackController } = props;
	return (
		<div>
			<h3>{playbackController?.title}</h3>
		</div>
	);
}

function togglePartyActive() {
	const queue = document.getElementById("ees-listening-party") as HTMLDivElement;
	queue.classList.toggle("active");
}
