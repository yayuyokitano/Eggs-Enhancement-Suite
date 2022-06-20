import QueueMusicRoundedIcon from "@mui/icons-material/QueueMusicRounded";
import "./queue.scss";

export default function Queue() {
  return (
    <div id="ees-player-queue">
      <button type="button" id="ees-player-queue-button">
        <QueueMusicRoundedIcon />
      </button>
      <div id="ees-player-queue-inner">
        <h2>hi</h2>
      </div>
    </div>
  )
}
