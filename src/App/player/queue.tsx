import { QueueMusicRoundedIcon } from "../../util/icons";
import TrackContainer from "../components/track/trackContainer";
import { TFunction } from "react-i18next";
import { PlaybackController } from "./playback";
import "./queue.scss";
import { useState } from "react";

function toggleQueueActive() {
  const queue = document.getElementById("ees-player-queue") as HTMLDivElement;
  queue.classList.toggle("active");
}

export default function Queue(props: { playbackController?:PlaybackController, t:TFunction }) {
  const { playbackController, t } = props;
  return (
    <div id="ees-player-queue">
      <button type="button" id="ees-player-queue-button" onClick={toggleQueueActive}>
        <QueueMusicRoundedIcon />
      </button>
      <QueueContent playbackController={playbackController} t={t} />
    </div>
  )
}

function QueueContent(props: { playbackController?:PlaybackController, t:TFunction }) {
  const { playbackController, t } = props;

  const [update, SetUpdate] = useState(true);
  playbackController?.removeAllListeners();
  playbackController?.on("update", () => {
    SetUpdate(!update);
  })

  return (
    <div id="ees-player-queue-inner">
      <PlayNext playbackController={playbackController} t={t} />
      <h3>{t("queue.playingNext")}</h3>
      <TrackContainer
        data={playbackController?.mainQueue}
        t={t}
        size="small"
        isQueue={true}
        playbackController={playbackController}
      />
    </div>
  )
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
  )
}
