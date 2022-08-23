import { TFunction } from "react-i18next";
import SyncRoundedIcon from "@mui/icons-material/SyncRounded";
import "./sync.scss";
import Syncer from "./syncer";

function toggleSyncActive() {
  const queue = document.getElementById("ees-sync") as HTMLDivElement;
  queue.classList.toggle("active");
}

export default function Sync(props: { t:TFunction }) {
  const { t } = props;

  return (
    <div id="ees-sync">
      <button type="button" id="ees-sync-button" onClick={toggleSyncActive}>
        <SyncRoundedIcon />
      </button>
      <SyncContent t={t} />
    </div>
  )
}

function SyncContent(props: { t:TFunction }) {
  const { t } = props;
  return (
    <div id="ees-sync-inner">
      <button type="button" id="ees-sync-test-button" onClick={() => startCaching(t)}>Test</button>
      <p id="ees-sync-status"></p>
      <div id="ees-sync-progress">
        <progress id="ees-sync-progress-full" max="100" value="0" />
        <progress id="ees-sync-progress-part" max="100" value="0" />
      </div>
    </div>
  )
}

async function startCaching(t:TFunction) {
  const syncButton = document.getElementById("ees-sync-button") as HTMLButtonElement;
  syncButton.classList.add("syncing");

  const syncer = new Syncer(t);
  await syncer.scan();
}
