import { TFunction } from "react-i18next";
import "./sync.scss";
import Syncer, { StateAction, StatusMessage, SyncStateReducerType } from "./syncer";
import React, { useEffect } from "react";
import { SyncRoundedIcon } from "../../../util/icons";
import { getEggsID } from "../../../util/util";

function toggleSyncActive() {
	const queue = document.getElementById("ees-sync") as HTMLDivElement;
	queue.classList.toggle("active");
}

interface SyncState extends SyncStateReducerType {
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
};

function statusHandler(t:TFunction, status:StatusMessage) {
	if (status.options != undefined) {
		return t(status.key, {
			...status.options,
			part: t(status.options.part),
		});
	}
	return t(status.key);
}

function reducer(state:SyncState, action:StateAction):SyncState {
	switch (action.type) {
	case "updateStatus":
		return {
			...state,
			...action.payload,
		};
	case "updateMessage":
		return {
			...state,
			status: action.payload,
		};
	case "setState":
		return {
			...state,
			state: action.payload,
		};
	default:
		return state;
	}
}

export default function Sync(props: { t:TFunction }) {
	const { t } = props;

	const [syncState, dispatch] = React.useReducer(reducer, initialState);

	return (
		<div
			id="ees-sync"
			className="ees-popout-wrapper">
			<button
				type="button"
				id="ees-sync-button"
				className={`ees-popout-button ${syncState.state}`}
				onClick={toggleSyncActive}>
				<SyncRoundedIcon />
			</button>
			<SyncContent
				t={t}
				syncState={syncState}
				dispatch={dispatch} />
		</div>
	);
}

function SyncContent(props: { t:TFunction, syncState:SyncState, dispatch:React.Dispatch<StateAction> }) {
	const { t, syncState, dispatch } = props;

	useEffect(() => {
		getEggsID().then(u => {
			if (u) {
				startCaching(syncState, dispatch, false);
			}
		});
		window.addEventListener("message", (event) => {
			if (event.data.type === "login") {
				startCaching(syncState, dispatch, false);
			}
		});
	}, []);

	return (
		<div
			id="ees-sync-inner"
			className="ees-popout-inner">
			<details className="ees-sync-button-wrapper">
				<summary>{t("sync.update")}</summary>
				<p>{t("sync.updateExplain")}</p>
				<button
					type="button"
					onClick={() => startCaching(syncState, dispatch, false)}>{t("sync.update")}</button>
			</details>
			<details className="ees-sync-button-wrapper">
				<summary>{t("sync.fullUpdate")}</summary>
				<p>{t("sync.fullUpdateExplain")}</p>
				<button
					type="button"
					onClick={() => startCaching(syncState, dispatch, true)}>{t("sync.fullUpdate")}</button>
			</details>
			<p id="ees-sync-status">{statusHandler(t, syncState.status)}</p>
			<div id="ees-sync-progress">
				<progress
					id="ees-sync-progress-full"
					max={syncState.progressFull.max}
					value={syncState.progressFull.value} />
				<progress
					id="ees-sync-progress-part"
					max={syncState.progressPart.max}
					value={syncState.progressPart.value} />
			</div>
		</div>
	);
}

async function startCaching(syncState:SyncState, dispatch:React.Dispatch<StateAction>, shouldFullCache:boolean) {

	if (syncState.state === "syncing") return;

	dispatch({
		type: "setState",
		payload: "syncing",
	});

	const syncer = new Syncer(dispatch, shouldFullCache);
	await syncer.scan();
}

