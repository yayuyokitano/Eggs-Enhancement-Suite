import { useEffect, useState } from "react";
import { TFunction } from "react-i18next";
import { SongData } from "../../../util/wrapper/eggs/artist";
import "./track.scss";
import Track, { SongDataWIndex } from "./track";
import { songLikeInfo, likeSong } from "../../../util/wrapper/eggs/evaluation";
import { PlaybackController } from "App/player/playback";

export default function TrackContainer(props: {data:SongData[]|SongDataWIndex[]|undefined, t:TFunction, size:"small"|"medium"|"large", isQueue?:boolean, playbackController?:PlaybackController}) {
	const {data, t, size, isQueue, playbackController} = props;
	const [likedTracks, setLikedTracks] = useState<string[]>([]);
	const [loggedIn, setLoggedIn] = useState(false);

	useEffect(() => {
		if (!data) return;
    
		songLikeInfo(data.map((track) => track.musicId)).then((likedTracks) => {
			const likedTrackList = likedTracks.data
				.filter((track) => track.isLike)
				.map((track) => track.musicId);
			setLikedTracks(likedTrackList);
			setLoggedIn(true);
		}).catch(() => {
			setLikedTracks([]);
			setLoggedIn(false);
		});
	}, []);

	return (
		<ul className="ees-track-container">
			{data?.map((song, i) => (
				<Track
					key={i}
					track={song}
					size={size}
					z={("eesIndex" in song) ? 10000000 - song.eesIndex : data.length-i}
					t={t}
					loggedIn={loggedIn}
					isLiked={likedTracks.includes(song.musicId)}
					toggleLiked={createToggleLiked(likedTracks, setLikedTracks)}
					isInQueue={isQueue}
					playbackController={playbackController}
				/>
			))}
		</ul>
	);
}

export function createToggleLiked(likedTracks:string[], setLikedTracks:React.Dispatch<React.SetStateAction<string[]>>) {
	return (e:React.MouseEvent<HTMLButtonElement, MouseEvent>, trackID:string, loggedIn:boolean) => {
		e.stopPropagation();
		if (!loggedIn) return;
		const isLiked = likedTracks.includes(trackID);
		const newLikedTracks = isLiked ? likedTracks.filter((t) => t !== trackID) : [...likedTracks, trackID];
		setLikedTracks(newLikedTracks);
		likeSong(trackID);
	};
}