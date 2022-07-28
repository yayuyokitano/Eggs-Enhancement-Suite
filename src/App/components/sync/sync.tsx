import { TFunction } from "react-i18next";
import SyncRoundedIcon from "@mui/icons-material/SyncRounded";
import "./sync.scss";
import browser from "webextension-polyfill";

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
    <div id="ees-player-queue-inner">
      <button type="button" id="ees-sync-test-button" onClick={sendTestMessage}>Test</button>
    </div>
  )
}

async function sendTestMessage() {
  const message = {
    type: "test",
    data: "testing the thing"
  };
  browser.runtime.sendMessage(message);
}

browser.runtime.onMessage.addListener(async (message: any) => {
  console.log(message);
});
