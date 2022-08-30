import { useEffect, useState } from "react";
import { TFunction } from "react-i18next";
import { toOrdinal } from "../../../util/util";
import { songLikeInfo } from "../../../util/wrapper/eggs/evaluation";
import { RankingSong } from "../../../util/wrapper/eggs/ranking";
import Track from "./track";
import { createToggleLiked } from "./trackContainer";

export default function RankTrackContainer(props: {data:RankingSong[]|undefined, t:TFunction, size:"small"|"medium"|"large"}) {
	const {data, t, size} = props;
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
		<ul className="ees-track-container ees-rank-track-container">
			{data?.map((song, i) => (
				<Track
					key={i}
					track={song.musicData}
					size={size}
					z={data.length-i}
					t={t}
					loggedIn={loggedIn}
					isLiked={likedTracks.includes(song.musicId)}
					toggleLiked={createToggleLiked(likedTracks, setLikedTracks)}
					isInQueue={false}
					label={toOrdinal(song.rank)}
				/>
			))}
		</ul>
	);
}