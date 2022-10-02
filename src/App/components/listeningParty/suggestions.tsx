import PlaybackController, { Suggestion } from "../../player/playbackController";
import { TFunction } from "react-i18next";
import { useEffect, useState } from "react";
import { defaultAvatar, getArtistPage, getTrackPage, getUserPage } from "../../../util/util";
import "./suggestions.scss";
import { FavoriteRoundedIcon, ModeCommentRoundedIcon, PlayArrowRoundedIcon } from "../../../util/icons";
import { UserStub } from "../../../util/wrapper/eggshellver/util";
import { SongData } from "../../../util/wrapper/eggs/artist";
import { navigateSafely } from "../../../util/loadHandler";

export default function Suggestions(props:{t:TFunction, playbackController?:PlaybackController}) {
	const { t, playbackController } = props;
	const [, setUpdate] = useState(false);
	const [selectedSuggestion, setSuggestion] = useState<Suggestion | null>(null);
	const [menuVisible, setMenuVisible] = useState(false);

	useEffect(() => {
		const controller = new AbortController();
		document.addEventListener("click", (e) => {
			const target = e.target as HTMLElement | null;
			if (target?.closest(".ees-suggestion-btn")) return;
			setMenuVisible(false);
		}, {signal: controller.signal});
		window.addEventListener("blur", () => {
			setMenuVisible(false);
		}, {signal: controller.signal});

		return () => {
			controller.abort();
		};
	}, []);
	

	playbackController?.on("updateSuggestions", () => {
		setUpdate((u) => !u);
		setTimeout(() => {
			updateScrollables();
		});
	});
	return (
		<div>
			<h4>{t("listeningParty.suggestions")}</h4>
			{playbackController?.suggestions?.filter(s => s.song !== null).map((s) => <Suggestion
				key={s.user.userName}
				suggestion={s}
				setSuggestion={setSuggestion}
				setMenuVisible={setMenuVisible} />)}
			{playbackController?.suggestions?.filter(s => s.song === null).map((s) => <SuggestionUser
				key={s.user.userName}
				suggestion={s}
				setSuggestion={setSuggestion}
				setMenuVisible={setMenuVisible} />)}
			<ContextMenu
				t={t}
				user={selectedSuggestion?.user}
				song={selectedSuggestion?.song}
				isVisible={menuVisible} />
			<div id="ees-suggestions-fixed-checker"></div>
		</div>
	);
}

function Suggestion(props:{suggestion: Suggestion, setSuggestion:React.Dispatch<React.SetStateAction<Suggestion | null>>, setMenuVisible:React.Dispatch<React.SetStateAction<boolean>>}) {
	const { suggestion, setSuggestion, setMenuVisible } = props;
	return (
		<button
			className="ees-suggestion ees-suggestion-btn"
			onClick={() => { setSuggestion(suggestion); setMenuVisible(true); }}>
			<div className="ees-suggestion-user">
				<div className="ees-suggestion-user-image-container">
					<img
						className="ees-suggestion-user-image"
						src={suggestion.user.imageDataPath || defaultAvatar} />
				</div>
				<span className="ees-suggestion-user-name">{suggestion.user.displayName}</span>
			</div>
			<div className="ees-suggestion-song">
				<img
					className="ees-suggestion-song-image"
					src={suggestion.song?.imageDataPath ?? suggestion.song?.artistData.imageDataPath ?? defaultAvatar} />
				<div className="ees-suggestion-song-info">
					<span className="ees-suggestion-song-title ees-scroll-container">
						<span>
							{suggestion.song?.musicTitle}
						</span>
					</span>
					<span className="ees-suggestion-song-artist ees-scroll-container">
						<span>
							{suggestion.song?.artistData.displayName}
						</span>
					</span>
				</div>
				<div className="ees-suggestion-song-stats">
					<div className="ees-suggestion-stat">
						<PlayArrowRoundedIcon className="ees-data-icon" />
						<span className="ees-data-count ees-track-playcount">{suggestion.song?.numberOfMusicPlays}</span>
					</div>
					<div className="ees-suggestion-stat">
						<FavoriteRoundedIcon className="ees-data-icon ees-track-likecount" />
						<span className="ees-data-count">{suggestion.song?.numberOfLikes}</span>
					</div>
				</div>
			</div>
		</button>
	);
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

function SuggestionUser(props:{suggestion: Suggestion, setSuggestion:React.Dispatch<React.SetStateAction<Suggestion | null>>, setMenuVisible:React.Dispatch<React.SetStateAction<boolean>>}) {
	const { suggestion, setSuggestion, setMenuVisible } = props;
	return (
		<button
			className="ees-suggestion-user-only ees-suggestion-user ees-suggestion-btn"
			onClick={() => { setSuggestion(suggestion); setMenuVisible(true); }}>
			<div className="ees-suggestion-user-image-container">
				<img
					className="ees-suggestion-user-image"
					src={suggestion.user.imageDataPath || defaultAvatar} />
			</div>
			<span className="ees-suggestion-user-name">{suggestion.user.displayName}</span>
		</button>
	);
}

function ContextMenu(props: { t: TFunction, user?: UserStub, song?: SongData|null, isVisible: boolean }) {
	const { t, user, song, isVisible } = props;
	const [left, setLeft] = useState(0);
	const [top, setTop] = useState(0);

	useEffect(() => {
		const controller = new AbortController();
		window.addEventListener("click", (e) => {
			const checker = document.getElementById("ees-suggestions-fixed-checker") as HTMLDivElement | null;
			if (checker === null) return;
			setLeft(e.clientX);
			setTop(e.clientY - checker.getBoundingClientRect().top - 1);
		}, { signal: controller.signal });
		return () => { controller.abort(); };
	}, []);

	if (user === undefined || song === undefined) return <ul className={`ees-suggestion-context-menu${isVisible ? " ees-suggestion-context-menu-visible" : ""}`}><li>{t("general.error")}</li></ul>;

	return (
		<ul
			className={`ees-suggestion-context-menu${isVisible ? " ees-suggestion-context-menu-visible" : ""}`}
			style={{left: left, top: top}}>
			<li><a href={getUserPage(user.userName)}>{t("listeningParty.viewProfile")}</a></li>
			{song && <li onClick={() => {navigateSafely(getArtistPage(song.artistData.artistName));}}>{t("global:track.goToArtistPage")}</li>}
			{song && <li onClick={() => {navigateSafely(getTrackPage(song.artistData.artistName, song.musicId));}} >{t("global:track.goToTrackPage")}</li>}
		</ul>
	);
}
