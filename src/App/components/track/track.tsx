import { defaultAvatar, getArtistPage, getTrackPage } from "../../../util/util";
import { SongData, SourceType } from "../../../util/wrapper/eggs/artist";
import "./track.scss";
import { TFunction } from "react-i18next";
import PlaybackController from "../../player/playbackController";
import { FavoriteBorderRoundedIcon, FavoriteRoundedIcon, ModeCommentRoundedIcon, MoreVertRoundedIcon, PlayArrowRoundedIcon } from "../../../util/icons";
import { navigateSafely } from "../../../util/loadHandler";

function elementContainsSelection(e:HTMLElement|null) {
	if (!e) return false;
	const sel = window.getSelection();
	if (!sel) return false;
	if (sel.rangeCount <= 0) return false;
	for (let i = 0; i < sel.rangeCount; i++) {
		if (sel.getRangeAt(i).startContainer === sel.getRangeAt(i).endContainer && sel.getRangeAt(i).startOffset === sel.getRangeAt(i).endOffset) return false;
		if (!e.contains(sel.getRangeAt(i).commonAncestorContainer)) {
			return false;
		}
	}
	return true;
}

export interface SongDataWIndex extends SongData {
  eesIndex:number;
}

function setPlayback(e:React.MouseEvent<HTMLLIElement, MouseEvent>, track:SongData) {
	if ((e.target as HTMLElement)?.closest(".ees-track-expandable")) return;

	const trackElements = e.currentTarget.closest(".ees-track-container")?.querySelectorAll(".ees-track");
	if (!trackElements) return;

	const trackList:SongData[] = [];
	for (const trackElement of trackElements) {
		if (!(trackElement instanceof HTMLElement)) continue;
		if (trackElement.dataset.track) trackList.push(JSON.parse(trackElement.dataset.track ?? "{}"));
	}

	window.parent.postMessage({
		type: "trackUpdate",
		data: {
			type: "setPlayback",
			track,
			trackList
		}
	}, "*");
}

function playNext(track:SongData) {
	window.parent.postMessage({
		type: "trackUpdate",
		data: {
			type: "playNext",
			track
		}
	}, "*");
}

function suggest(track:SongData) {
	window.parent.postMessage({
		type: "trackUpdate",
		data: {
			type: "suggest",
			track
		}
	}, "*");
}

function addToQueue(track:SongData) {
	window.parent.postMessage({
		type: "trackUpdate",
		data: {
			type: "addToQueue",
			track
		}
	}, "*");
}

function removeFromQueue(track:SongData|SongDataWIndex, playbackController?:PlaybackController) {
	if (!playbackController) return;
	if (!("eesIndex" in track)) return;
	playbackController.removeFromQueue(track.eesIndex);
}

function addToPlaylist(track:SongData) {
	const header = (document.querySelector("#ees-playlist-dialog h2") as HTMLElement);
	header.dataset.musicId = track.musicId;
	header.dataset.artistId = track.artistData.artistId.toString();
	(document.querySelector("#ees-playlist-dialog") as HTMLDialogElement).showModal();
}

function skipTo(e:React.MouseEvent<HTMLLIElement, MouseEvent>, track:SongData|SongDataWIndex, playbackController?:PlaybackController) {
	if ((e.target as HTMLElement)?.closest(".ees-track-expandable")) return;
	if (!playbackController) return;
	if (!("eesIndex" in track)) return;
	playbackController.skipTo(track.eesIndex);
}

export default function Track(props:{
  track:SongData|SongDataWIndex,
  size:"small"|"medium"|"large",
  z:number, t:TFunction,
  loggedIn:boolean,
  isLiked:boolean,
  toggleLiked:(e: React.MouseEvent<HTMLButtonElement, MouseEvent>, trackID: string, loggedIn:boolean) => void
  isInQueue?:boolean,
  playbackController?:PlaybackController
	label?:string
}) {
	const {track, size, z, t, loggedIn, isLiked, toggleLiked, isInQueue, playbackController, label} = props;

	return (
		<li
			key={track.musicId}
			className={`ees-track ees-track-${size}`}
			data-track={JSON.stringify(track)}
			onClick={(e) => {!elementContainsSelection(e.currentTarget.closest(".ees-track")) && (isInQueue ? skipTo(e, track, playbackController) : setPlayback(e, track));}}
			tabIndex={0}
		>
			<div className={`ees-track-special ${songClasses(track)}`}></div>
			{label && <div className="ees-track-label">{label}</div>}
			<img
				className="ees-track-thumb"
				src={track.imageDataPath ?? track.artistData.imageDataPath ?? defaultAvatar}
				alt="" />
			<div className="ees-track-info">
				<span className="ees-track-title">{track.musicTitle}</span>
				<span className="ees-artist-name">{track.artistData.displayName}</span>
				<div className="ees-track-details">
					<div>
						<PlayArrowRoundedIcon className="ees-data-icon" />
						<span className="ees-data-count ees-track-playcount">{track.numberOfMusicPlays}</span>
					</div>
					<div>
						<FavoriteRoundedIcon className="ees-data-icon ees-track-likecount" />
						<span className="ees-data-count">{track.numberOfLikes}</span>
					</div>
					<div>
						<ModeCommentRoundedIcon className="ees-data-icon ees-track-commentcount" />
						<span className="ees-data-count">{track.numberOfComments}</span>
					</div>
				</div>
			</div>
			<div className="ees-track-right">
				<button
					type="button"
					className="ees-track-like"
					data-liked={isLiked}
					onClick={(e) => {toggleLiked(e, track.musicId, loggedIn);}}>
					{
						isLiked ?
							<FavoriteRoundedIcon /> :
							<FavoriteBorderRoundedIcon />
					}
				</button>
			</div>
			<details
				style={{zIndex: z}}
				className="ees-track-expandable">
				<summary><MoreVertRoundedIcon /></summary>
				<ul className="ees-track-menu">
					{isInQueue && <li onClick={ () => { removeFromQueue(track, playbackController); } }>{t("global:track.removeFromQueue")}</li>}
					<li onClick={() => { playNext(track); }}>{t("global:track.playNext")}</li>
					<li onClick={() => { addToQueue(track); }}>{t("global:track.addToQueue")}</li>
					{loggedIn && <li
						className="ees-playlist-modal-creator"
						onClick={(e) => { addToPlaylist(track); e.stopPropagation(); }}>{t("global:track.addToPlaylist")}</li>}
					<li onClick={() => {navigateSafely(getArtistPage(track.artistData.artistName));}}>{t("global:track.goToArtistPage")}</li>
					<li onClick={() => {navigateSafely(getTrackPage(track.artistData.artistName, track.musicId));}} >{t("global:track.goToTrackPage")}</li>
					<li onClick={() => { suggest(track); }}>{t("global:track.suggest")}</li>
				</ul>
			</details>
		</li>
	);
}

function songClasses(track:SongData|SongDataWIndex) {
	const classes:string[] = [];
	if (track.sourceType === SourceType.YouTube) classes.push("ees-track-youtube");
	if (track.isFollowerOnly) classes.push("ees-track-follower-only");
	return classes.join(" ");
}

document.addEventListener("click", (e) => {
	const targetDetails = (e.target as HTMLElement)?.closest(".ees-track-expandable");
	const summaryDetails = (e.target as HTMLElement)?.closest("summary");
	const isOpen = targetDetails?.hasAttribute("open");
	document.querySelectorAll(".ees-track-expandable").forEach((details) => {
		details.removeAttribute("open");
	});

	if (summaryDetails && isOpen) {
		e.preventDefault();
	}


});

window.addEventListener("blur", () => {
	document.querySelectorAll(".ees-track-expandable").forEach((details) => {
		details.removeAttribute("open");
	});
});

