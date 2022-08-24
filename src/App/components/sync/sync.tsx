import { TFunction } from "react-i18next";
import SyncRoundedIcon from "@mui/icons-material/SyncRounded";
import "./sync.scss";
import Syncer from "./syncer";
import React, { useEffect } from "react";

function toggleSyncActive() {
  const queue = document.getElementById("ees-sync") as HTMLDivElement;
  queue.classList.toggle("active");
}

interface SyncState {
  progressPart: {
    value: number;
    max: number;
  },
  progressFull: {
    value: number;
    max: number;
  },
  status: StatusMessage;
  state: "" | "syncing" | "errored";
}

const initialState:SyncState = {
  progressPart: {
    value: 0,
    max: 100,
  },
  progressFull: {
    value: 0,
    max: 4,
  },
  status: {
    key: "",
  },
  state: "",
}

export type StateAction = ({
  type: "updateStatus";
  payload: {
    progressPart: {
      value: number;
      max: number;
    };
    progressFull: {
      value: number;
      max: number;
    };
    status:StatusMessage;
  };
})|({
  type: "setState";
  payload: ""|"syncing"|"errored";
})|({
  type: "updateMessage";
  payload: StatusMessage;
});

function statusHandler(t:TFunction, status:StatusMessage) {
  if (status.options != undefined) {
    return t(status.key, {
      ...status.options,
      part: t(status.options.part),
    });
  }
  return t(status.key);
}

interface StatusMessage {
  key: string;
  options?: {
    part: string;
    progress?: number;
  };
}

function reducer(state:SyncState, action:StateAction):SyncState {
  console.log(action);
  switch (action.type) {
    case "updateStatus":
      return {
        ...state,
        ...action.payload,
      }
    case "updateMessage":
      return {
        ...state,
        status: action.payload,
      }
    case "setState":
      return {
        ...state,
        state: action.payload,
      }
    default:
      return state;
  }
}

export default function Sync(props: { t:TFunction }) {
  const { t } = props;

  const [syncState, dispatch] = React.useReducer(reducer, initialState);
  useEffect(() => {console.log(syncState)} ,[syncState]);

  return (
    <div id="ees-sync">
      <button type="button" id="ees-sync-button" className={syncState.state} onClick={toggleSyncActive}>
        <SyncRoundedIcon />
      </button>
      <SyncContent t={t} syncState={syncState} dispatch={dispatch} />
    </div>
  )
}

function SyncContent(props: { t:TFunction, syncState:SyncState, dispatch:React.Dispatch<StateAction> }) {
  const { t, syncState, dispatch } = props;
  return (
    <div id="ees-sync-inner">
      <button type="button" id="ees-sync-test-button" onClick={() => startCaching(syncState, dispatch, false)}>Test</button>
      <button type="button" id="ees-sync-start-button" onClick={() => startCaching(syncState, dispatch, true)}>FullTest</button>
      <p id="ees-sync-status">{statusHandler(t, syncState.status)}</p>
      <div id="ees-sync-progress">
        <progress id="ees-sync-progress-full" max={syncState.progressFull.max} value={syncState.progressFull.value} />
        <progress id="ees-sync-progress-part" max={syncState.progressPart.max} value={syncState.progressPart.value} />
      </div>
    </div>
  )
}

async function startCaching(syncState:SyncState, dispatch:React.Dispatch<StateAction>, shouldFullCache:boolean) {

  if (syncState.state === "syncing") return;

  dispatch({
    type: "setState",
    payload: "syncing",
  })

  const syncer = new Syncer(dispatch, shouldFullCache);
  await syncer.scan();
}

