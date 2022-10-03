import { QueueMusicRoundedIcon } from "../../util/icons";
import TrackContainer from "../components/track/trackContainer";
import { TFunction } from "react-i18next";
import PlaybackController from "./playbackController";
import "./queue.scss";
import { useEffect, useState } from "react";

function toggleQueueActive() {
	const queue = document.getElementById("ees-player-queue") as HTMLDivElement;
	queue.classList.toggle("active");
}

export default function Queue(props: { playbackController?:PlaybackController, t:TFunction }) {
	const { playbackController, t } = props;
	return (
		<div
			id="ees-player-queue"
			className="ees-popout-wrapper">
			<button
				type="button"
				id="ees-player-queue-button"
				className="ees-popout-button"
				onClick={toggleQueueActive}>
				<QueueMusicRoundedIcon />
			</button>
			<QueueContent
				playbackController={playbackController}
				t={t} />
		</div>
	);
}

function QueueContent(props: { playbackController?:PlaybackController, t:TFunction }) {
	const { playbackController, t } = props;

	const [, setUpdate] = useState(true);
	useEffect(() => {
		const listener = () => {
			setUpdate(u => !u);
		};

		playbackController?.on("update", listener);
		return () => {
			playbackController?.off("update", listener);
		};
	});

	return (
		<div
			id="ees-player-queue-inner"
			className="ees-popout-inner">
			<PlayNext
				playbackController={playbackController}
				t={t} />
			<h3>{t("queue.playingNext")}</h3>
			<TrackContainer
				data={playbackController?.mainQueue}
				t={t}
				size="small"
				isQueue={true}
				playbackController={playbackController}
			/>
		</div>
	);
}

function PlayNext(props: { playbackController?:PlaybackController, t:TFunction }) {
	const { playbackController, t } = props;
	if (!playbackController?.priorityQueue?.length) return <></>;

	return (
		<div id="ees-player-queue-manuallyadded">
			<h3>{t("queue.manuallyAdded")}</h3>
			<TrackContainer
				data={playbackController?.priorityQueue}
				t={t}
				size="small"
				isQueue={true}
				playbackController={playbackController}
			/>
		</div>
	);
}
