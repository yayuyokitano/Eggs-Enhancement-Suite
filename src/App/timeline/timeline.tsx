import { PlaylistCover } from "../components/playlistcover";
import React, { useEffect, useState } from "react";
import { TFunction } from "react-i18next";
import { Playlist } from "../../util/wrapper/eggs/playlists";
import { cache } from "../../util/loadHandler";
import { getTimeline, TimelineEvent } from "../../util/wrapper/eggshellver/timeline";
import "./timeline.scss";
import { SongData } from "../../util/wrapper/eggs/artist";
import TrackContainer from "../components/track/trackContainer";
import UserCapsule from "../components/userCapsule";

function timelineEffect(
	setError:React.Dispatch<React.SetStateAction<boolean>>,
	setLoading:React.Dispatch<React.SetStateAction<boolean>>,
	setChildren:React.Dispatch<React.SetStateAction<TimelineEvent[]>>,
	setOffset:React.Dispatch<React.SetStateAction<number>>,
	offset:number
) {
	cache.getEggsID().then((eggsID) => {
		if (!eggsID) {
			setError(true);
			return;
		}
		getTimeline({
			eggsID: eggsID ?? "",
			offset,
			limit: 50,
		}).then((events) => {
			setChildren(c => [...c, ...events]);
			if (events.length > 0) {
				setOffset(o => o + 50);
				setLoading(false);
			}
		}).catch(console.error);
	});
}

function timelineTargetUnique(e:TimelineEvent) {
	switch (e.type) {
	case "playlist":
	case "playlistlike":
		return e.target.playlistId;
	case "music":
	case "musiclike":
		return e.target.musicId;
	case "follow":
		return e.target.userId;
	}

}

export default function Timeline(t:TFunction) {
	const [children, setChildren] = useState<TimelineEvent[]>([]);
	const [offset, setOffset] = useState(0);
	const [isLoading, setLoading] = useState(true);
	const [error, setError] = useState(false);
	const [remainingScroll, setRemainingScroll] = useState(0);

	useEffect(() => {
		window.addEventListener("scroll", () => {
			setRemainingScroll(document.body.scrollHeight - window.innerHeight - window.scrollY);
		});
		timelineEffect(setError, setLoading, setChildren, setOffset, offset);
	}, []);

	useEffect(() => {
		if (isLoading) return;
		if (remainingScroll > 1000) return;
		setLoading(true);
		timelineEffect(setError, setLoading, setChildren, setOffset, offset);
	}, [remainingScroll]);

	return (
		<div
			id="ees-timeline">
			<h1>{t("timeline.title")}</h1>
			{children.map((child) => (
				<div
					className="timeline-event"
					key={`${child.user.userName}${timelineTargetUnique(child)}${child.type}`}>
					<span className="timeline-event-title">{t(`timeline.sub.${child.type}`, {user: child.user.displayName})}</span>
					<TimelineItem
						t={t}
						event={child} />
				</div>
			))}
			{error && <div id="ees-timeline">{t("general.error")}</div>}
			{isLoading && <div id="ees-timeline">{t("general.loading")}</div>}
		</div>
	);
}

function TimelinePlaylist(props:{t:TFunction, playlist:Playlist}) {
	const { playlist } = props;
	return (
		<a
			className="ees-timeline-playlist"
			href={`https://eggs.mu/?playlist=${playlist.playlistId}`}>
			<h3 className="ees-timeline-playlist-name">{playlist.playlistName || "\u00A0"}</h3>
			<div className="ees-playlist-cover-wrapper">
				<PlaylistCover
					imageURLs={playlist.arrayOfImageDataPath.split(",")}
					columnCount={2}
					rowCount={2}
					width={150}
					height={150} />
			</div>
		</a>
	);
}

function TimelineMusic(props:{t:TFunction, song:SongData}) {
	const { t, song } = props;
	return (
		<TrackContainer
			data={[song]}
			t={t}
			size="large" />
	);
}

function TimelineItem(props:{t:TFunction, event:TimelineEvent}) {
	const { t, event } = props;
	switch(event.type) {
	case "playlist":
	case "playlistlike":
		return <TimelinePlaylist
			t={t}
			playlist={event.target} />;
	case "music":
	case "musiclike":
		return <TimelineMusic
			t={t}
			song={event.target} />;
	case "follow":
		return <UserCapsule
			t={t}
			user={event.target} />;
	}
}
