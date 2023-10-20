import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import { convertTime, defaultAvatar, getVolume, lastfmAuthLink, PopupMessage, processAlbumName, processArtistName, processTrackName, updateVolume } from "../../util/util";
import { SongData } from "../../util/wrapper/eggs/artist";
import { initializePlayback, setPlaybackDynamicLocal, setPlaybackLocal } from "./playback";
import "./spa.scss";
import { Repeat } from "../../util/queue";
import { DetailsRoundedIcon, LastFMIcon, PauseRoundedIcon, PlayArrowRoundedIcon, RepeatOneRoundedIcon, RepeatRoundedIcon, ShuffleRoundedIcon, SkipNextRoundedIcon, SkipPreviousRoundedIcon, VolumeUpRoundedIcon } from "../../util/icons";
import LastFM from "../../util/wrapper/lastfm";
import { getInfo as TrackInfo } from "../../util/wrapper/lastfm/interfaces/trackInterface";
import { apiKey, apiSecret, userAgent } from "../../util/scrobbler";
import "../../i18n/config";
import { TFunction, useTranslation } from "react-i18next";
import browser from "webextension-polyfill";
import { TimeData } from "./types";
import Details from "./details";
import Queue from "./queue";
import Sync from "../components/sync/sync";
import { updateTheme } from "../../theme/themes";
import PlaybackController from "./playbackController";
import { initializeSocketPlayback } from "./socketPlayback";
import ListeningParty from "../components/listeningParty/listeningParty";
let root:ReactDOM.Root;

export function createSpa() {
	const wrapper = document.createElement("div");
	wrapper.id = "eggs-full-wrapper";
	document.body.replaceChildren(wrapper);
	const root = ReactDOM.createRoot(wrapper);
	root.render(<SPA />);
}

function updateScrollables() {
	for (const scrollContainer of document.querySelectorAll(".ees-scroll-container") as NodeListOf<HTMLElement>) {
		const scrollable = scrollContainer.firstElementChild;
		if (!scrollable) return;
		if (scrollContainer.clientWidth < scrollable.clientWidth) {
			scrollable.classList.add("ees-scroll-animated");
		} else {
			scrollable.classList.remove("ees-scroll-animated");
		}
	}
}

window.addEventListener("resize", updateScrollables);

export function updateSpa(url?:string) {
	console.log(url);
	if (typeof url !== "undefined") {
		history.replaceState(null, "", url);
	}
}

async function changeBool(name:string, value:boolean, playbackController?:PlaybackController) {
	playbackController?.setBool(name, value);
	await browser.storage.sync.set({
		[name]: value
	});
}

function SPA() {

	const {t, i18n} = useTranslation(["global"]);

	const [playbackController, setPlaybackController] = useState<PlaybackController>();

	useEffect(() => {
		function handleMessage(message:PopupMessage) {
			switch (message.type) {
			case "changeLanguage":
				console.log("change language to " + message.lang);
				i18n.changeLanguage(message.lang);
				break;
			case "changeTheme":
				console.log("change theme to " + message.theme);
				updateTheme(message.theme);
				break;
			case "changeBool":
				console.log("change " + message.name + " to " + message.value);
				changeBool(message.name, message.value, playbackController);
				break;
			}
		}
		browser.runtime.onMessage.addListener(handleMessage);
		return () => {
			browser.runtime.onMessage.removeListener(handleMessage);
		};
	});

	return (
		<div>
			<iframe
				id="ees-spa-iframe"
				src={window.location.href}
			/>
			<Player
				t={t}
				playbackController={playbackController}
				setPlaybackController={setPlaybackController} />
			<Queue
				playbackController={playbackController}
				t={t} />
			<Sync t={t} />
			<ListeningParty
				t={t}
				playbackController={playbackController} />
		</div>
	);
}

function Player(props:{ t:TFunction, playbackController?:PlaybackController, setPlaybackController:React.Dispatch<React.SetStateAction<PlaybackController | undefined>>}) {
	const { t, playbackController, setPlaybackController } = props;

	const [current, setCurrent] = useState<SongData>();
	const [timeData, setTimeData] = useState<TimeData>({
		current: 0,
		duration: 0
	});
	const [shuffle, setShuffle] = useState(true);
	const [repeat, setRepeat] = useState(Repeat.All);
	const [volume, setVolume] = useState(1);
	const [controllerType, setControllerType] = useState<"local" | "socket">("local");
	const youtubeRef = useRef<HTMLIFrameElement>(null);

	useEffect(() => {
		if (root) return;
		const audioContainer = document.getElementById("ees-audio-container");
		if (!audioContainer) return;
		root = ReactDOM.createRoot(audioContainer);
		getVolume().then(v => {
			setVolume(v ?? 1);
			playbackController?.closeConnection();
			setPlaybackController(initializePlayback(root, setCurrent, youtubeRef, setTimeData, setShuffle, setRepeat, setVolume, volume));
		});

		window.addEventListener("message", async(event) => {
			if (event.origin !== window.location.origin) {
				return;
			}
			if (event.data.type !== "trackUpdate") {
				return;
			}
			switch(event.data.data.type) {
			case "setPlayback":
			case "setPlaybackDynamic":
			{
				if (controllerType !== "local") {
					setControllerType("local");
					playbackController?.closeConnection();
					setPlaybackController(initializePlayback(root, setCurrent, youtubeRef, setTimeData, setShuffle, setRepeat, setVolume, volume));
					if (event.data.type === "setPlaybackDynamic" && playbackController) {
						setPlaybackDynamicLocal(event.data.data, playbackController);
					} else if (playbackController) {
						setPlaybackLocal(event.data.data, playbackController);
					}
				}
				break;
			}
			case "setPlaybackSocket":
			{
				setControllerType("socket");
				playbackController?.closeConnection();
				setPlaybackController(() => {
					const controller = initializeSocketPlayback(root, setCurrent, youtubeRef, setTimeData, setShuffle, setRepeat, setVolume, volume);
					controller.initSocket(event.data.data.targetID);
					return controller;
				});
				break;
			}
			}
		});
	}, []);

	useEffect(() => { updateScrollables(); }, [current]);

	useEffect(() => { updateVolume(volume, playbackController); }, [volume]);

	function toggleTrackDetails() {
		const details = document.getElementById("ees-player-details");
		if (!details) return;
		details.classList.toggle("active");
	}

	return (
		<div id="ees-player-container">
			<div id="ees-player">
				<img
					id="ees-player-thumbnail"
					src={current?.imageDataPath ?? current?.artistData.imageDataPath ?? defaultAvatar} />
				<div id="ees-player-metadata">
					<span
						id="ees-player-title"
						className="ees-scroll-container"><span>{current?.musicTitle}</span></span>
					<span
						id="ees-player-artist"
						className="ees-scroll-container"><span>{current?.artistData.displayName}</span></span>
				</div>
				<div id="ees-player-controls">
					<div id="ees-player-controls-buttons">
						<LastFMButton
							track={current}
							t={t}
							playbackController={playbackController} />
						<button
							type="button"
							id="ees-shuffle"
							className="ees-navtype"
							data-state={shuffle}
							onClick={() => playbackController?.toggleShuffle()}><ShuffleRoundedIcon /></button>
						<button
							type="button"
							id="ees-prev"
							className="ees-playnav"
							onClick={() => {playbackController?.previous();}}><SkipPreviousRoundedIcon /></button>
						<button
							type="button"
							id="ees-play"
							className={`ees-playpause ${playbackController?.isPlaying ? "ees-hidden":""}`}
							onClick={() => {playbackController?.play();}}><PlayArrowRoundedIcon /></button>
						<button
							type="button"
							id="ees-pause"
							className={`ees-playpause ${playbackController?.isPlaying ? "":"ees-hidden"}`}
							onClick={() => {playbackController?.pause();}}><PauseRoundedIcon /></button>
						<button
							type="button"
							id="ees-next"
							className="ees-playnav"
							onClick={() => {playbackController?.next();}}><SkipNextRoundedIcon /></button>
						<button
							type="button"
							id="ees-repeat"
							className="ees-navtype"
							data-state={repeat}
							onClick={() => playbackController?.cycleRepeat()}>{
								repeat === Repeat.One ?
									<RepeatOneRoundedIcon /> :
									<RepeatRoundedIcon />
							}</button>
						<VolumeButton
							volume={volume}
							setVolume={setVolume} />
					</div>
					<div
						id="ees-player-controls-time"
						data-current={timeData?.current}
						data-duration={timeData?.duration || 0}>
						<span id="ees-player-current-time">{convertTime(timeData?.current ?? 0)}</span>
						<progress
							value={timeData?.current}
							max={timeData?.duration || 0}
							onClick={(e) => { 
								playbackController?.setCurrentTime((e.clientX - e.currentTarget.offsetLeft) / e.currentTarget.offsetWidth);
							}} />
						<span id="ees-player-duration">{convertTime(timeData?.duration ?? 0)}</span>
					</div>
				</div>
				<button
					type="button"
					id="ees-track-expander"
					onClick={() => { toggleTrackDetails(); }}>
					<DetailsRoundedIcon />
				</button>
				<div id="ees-audio-container" />
			</div>
			<Details
				track={current}
				t={t}
				youtubeRef={youtubeRef} />
		</div>
	);
}

function LastFMButton(props: { track: SongData|undefined, t:TFunction, playbackController:PlaybackController|undefined}) {
	const { track, t, playbackController } = props;

	const [sk, setSk] = useState("");
	const [lastfmTrack, setLastfmTrack] = useState<TrackInfo>();
	const [processedTrack, setProcessedTrack] = useState({
		track: "",
		album: "",
		artist: ""
	});
	const [trackForm, setTrackForm] = useState({
		track: "",
		album: "",
		artist: ""
	});

	const lastfm = new LastFM(apiKey, {
		apiSecret,
		userAgent
	});

	useEffect(() => {
		if (sk) return;
		browser.storage.sync.get("lastfmToken").then((token) => {
			if (!token.lastfmToken) return;
			setSk(token.lastfmToken);
		});
	}, []);

	useEffect(() => {

		if (!track) {
			setProcessedTrack({
				track: "",
				album: "",
				artist: "",
			});
			return;
		}

		try {
			browser.storage.local.get(track.musicId).then((e) => {
				setTrack(e[track.musicId], track, lastfm, sk, setLastfmTrack, setProcessedTrack);
			}).catch((e) => console.warn(e));
		} catch(e) {
			setTrack(null, track, lastfm, sk, setLastfmTrack, setProcessedTrack);
		}
    
	}, [track]);

	useEffect(() => {
		setTrackForm(processedTrack);
		if (!playbackController) return;
		playbackController.scrobbleInfo = processedTrack;
		lastfm.track.getInfo(lastfm.helper.TrackFromName(processedTrack.artist, processedTrack.track), { sk }).then((e) => {
			setLastfmTrack(e);
		}).catch(() => {
			setLastfmTrack(undefined);
		});
	}, [processedTrack]);

	if (!sk) return (
		<a 
			id="ees-lastfm"
			className="ees-navtype ees-disabled"
			href={lastfmAuthLink()}
		>
			<LastFMIcon />
		</a>
	);
  
	return (
		<div id="ees-lastfm-container">
			<button
				id="ees-lastfm"
				className="ees-navtype"
				onClick={(e) => { togglePopup(e, "ees-lastfm-edit"); }}>
				<LastFMIcon />
				<div
					id="ees-lastfm-playcount"
					data-displayed={lastfmTrack?.userplaycount || lastfmTrack?.userplaycount === 0}>
					{
						lastfmTrack?.userplaycount || lastfmTrack?.userplaycount === 0 ?
							<PlayArrowRoundedIcon /> : <></>
					}
					<span>{lastfmTrack?.userplaycount}</span>
				</div>
			</button>
			<dialog id="ees-lastfm-edit">
				<div
					id="ees-lastfm-edit-window"
					onKeyDown={(e) => {onKeyDown(e, track, setProcessedTrack);}}>
					<label htmlFor="ees-lastfm-edit-track">{t("general.song", {count: 1})}</label>
					<input
						type="text"
						id="ees-lastfm-edit-track"
						name="track"
						value={trackForm.track}
						onChange={(e) => { setTrackForm({
							track: e.target.value,
							album: trackForm.album,
							artist: trackForm.artist
						}); }}
					/>
					<label htmlFor="ees-lastfm-edit-album">{t("general.album", {count: 1})}</label>
					<input
						type="text"
						id="ees-lastfm-edit-album"
						name="album"
						value={trackForm.album}
						onChange={(e) => { setTrackForm({
							track: trackForm.track,
							album: e.target.value,
							artist: trackForm.artist
						}); }}
					/>
					<label htmlFor="ees-lastfm-edit-artist">{t("general.artist", {count: 1})}</label>
					<input
						type="text"
						id="ees-lastfm-edit-artist"
						name="artist"
						value={trackForm.artist}
						onChange={(e) => { setTrackForm({
							track: trackForm.track,
							album: trackForm.album,
							artist: e.target.value
						}); }}
					/>
					<button
						type="button"
						id="ees-lastfm-submit-edit"
						onClick={() => {saveEdit(track, setProcessedTrack);}}>{t("general.confirm")}</button>
				</div>
			</dialog>
		</div>
	);
}

function VolumeButton(props:{ volume:number, setVolume:React.Dispatch<React.SetStateAction<number>>}) {
	const { volume, setVolume } = props;
	return (
		<div id="ees-volume-container">
			<button
				type="button"
				id="ees-volume"
				className="ees-navtype"
				onClick={(e) => { togglePopup(e, "ees-volume-edit"); }}>
				<VolumeUpRoundedIcon />
			</button>
			<dialog id="ees-volume-edit">
				<input
					id="ees-volume-slider"
					type="range"
					min={0}
					max={1}
					step={0.01}
					value={volume}
					onChange={(e) => { setVolume(Number(e.target.value)); }} />
			</dialog>
		</div>
	);
}

function togglePopup(e:React.MouseEvent<HTMLButtonElement, MouseEvent>, id:string) {
	const popup = document.getElementById(id) as HTMLDialogElement;
	if (popup.open) {
		popup?.close();
	} else {
		document.querySelectorAll("dialog").forEach((e) => {e.close();});
		popup?.show();
	}
	e.stopPropagation();
}

window.addEventListener("click", (e) => {
	document.querySelectorAll("dialog").forEach((dialog) => {
		if (e.target as HTMLElement !== dialog) return;
		dialog.close();
	});
});

window.addEventListener("blur", () => {
	document.querySelectorAll("dialog")?.forEach((e) => {e.close();});
});

function onKeyDown(e:React.KeyboardEvent<HTMLDivElement>, track:SongData|undefined, setProcessedTrack:React.Dispatch<React.SetStateAction<{
  track: string;
  album: string;
  artist: string;
}>>) {
	if (e.key !== "Enter" || e.keyCode === 229) return; //keycode 229 indicates IME is being used atm. Dont submit.
	saveEdit(track, setProcessedTrack);
}

function saveEdit(track:SongData|undefined, setProcessedTrack:React.Dispatch<React.SetStateAction<{
  track: string;
  album: string;
  artist: string;
}>>) {
	if (!track) return;
	const editedTrack = {
		track: (document.getElementById("ees-lastfm-edit-track") as HTMLInputElement)?.value,
		album: (document.getElementById("ees-lastfm-edit-album") as HTMLInputElement)?.value ?? "",
		artist: (document.getElementById("ees-lastfm-edit-artist") as HTMLInputElement)?.value,
	};
	if (!editedTrack.track || !editedTrack.track) return;
	(document.getElementById("ees-lastfm-edit") as HTMLDialogElement)?.close();
	try {
		browser.storage.local.set({
			[track.musicId]: editedTrack
		});
		setProcessedTrack(editedTrack);
	} catch(e) {
		console.error("Failed to save edit.");
		console.error(e);
	}
}

function setTrack(
	edit:{
    artist:string,
    album:string,
    track:string,
  }|null,
	track:SongData,
	lastfm:LastFM, sk:string,
	setLastfmTrack:React.Dispatch<React.SetStateAction<TrackInfo | undefined>>,
	setProcessedTrack:React.Dispatch<React.SetStateAction<{
    track: string;
    album: string;
    artist: string;
  }>>
){
	let newTrack = {
		track: "",
		album: "",
		artist: "",
	};

	if (edit) {
		newTrack = {
			track: edit.track,
			album: edit.album,
			artist: edit.artist,
		};
	}

	lastfm.track.getInfo(lastfm.helper.TrackFromName(newTrack.artist || track.artistData.displayName, newTrack.track || processTrackName(track.musicTitle)), {
		sk
	}).then(lfmTrack => {
		setLastfmTrack(lfmTrack);
    
		if (!edit) {
			newTrack = {
				track: processTrackName(track.musicTitle),
				album: processAlbumName(lfmTrack?.album?.title),
				artist: processArtistName(track.artistData.displayName),
			};
		}

		setProcessedTrack(newTrack);

	}).catch(() => {

		setLastfmTrack(undefined);
		if (!edit) {
			newTrack = {
				track: processTrackName(track.musicTitle),
				album: "",
				artist: processArtistName(track.artistData.displayName),
			};
		}
    
		setProcessedTrack(newTrack);

	});
}
