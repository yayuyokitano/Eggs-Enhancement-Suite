import React, { useEffect, useState } from "react";
import { TFunction } from "react-i18next";
import { getUsers } from "../../util/wrapper/eggshellver/user";
import { FavoriteBorderRoundedIcon, FavoriteRoundedIcon } from "../../util/icons";
import { likePlaylist, playlistLikeInfo } from "../../util/wrapper/eggs/evaluation";
import { Playlist, playlist } from "../../util/wrapper/eggs/playlists";
import { PlaylistCover } from "../components/playlistcover";
import TrackContainer from "../components/track/trackContainer";
import "./playlist.scss";
import { UserStub } from "../../util/wrapper/eggshellver/util";
import { getUserPage } from "../../util/util";

export function toggleLiked(e:React.MouseEvent<HTMLButtonElement, MouseEvent>, playlistID:string, loggedIn:boolean, setLiked:React.Dispatch<React.SetStateAction<boolean>>, setLikeCount:React.Dispatch<React.SetStateAction<number>>) {
	e.stopPropagation();
	if (!loggedIn) return;
	setLiked((wasLiked) => {
		setLikeCount((count) => wasLiked ? count - 1 : count + 1);
		return !wasLiked;
	});
	likePlaylist(playlistID);
}

export default function Playlist(t:TFunction) {

	const playlistID = new URLSearchParams(window.location.search).get("playlist");
	if (!playlistID) return (
		<div id="ees-playlist">
			{t("playlist.error")}
		</div>
	);

	const [data, setData] = useState<Playlist>();
	const [isLoading, setLoading] = useState(false);
	const [error, setError] = useState(false);
	const [likeCount, setLikeCount] = useState(0);
	const [isLiked, setLiked] = useState(false);
	const [loggedIn, setLoggedIn] = useState(false);
	const [creatorStub, setCreatorStub] = useState<UserStub>();

	useEffect(() => {
		setLoading(true);
		
		playlist(playlistID).then((playlistData) => {
			setData(playlistData.data[0]);
			setLoading(false);
			playlistLikeInfo([playlistID]).then((data) => {
				setLikeCount(data.data[0].numberOfLikes);
				setLiked(data.data[0].isLike);
				setLoggedIn(true);
			}).catch(() => {
				setLikeCount(0);
				setLiked(false);
				setLoggedIn(false);
			});

			getUsers({
				userids: [playlistData.data[0].userId]
			}).then((userData) => {
				setCreatorStub(userData[0]);
			}).catch(console.error);
		}).catch(() => {
			setError(true);
			setLoading(false);
		});
	}, []);
  
	if (isLoading) return (
		<div id="ees-playlist">
			{t("general.loading")}
		</div>
	);

	if (error || !data) return (
		<div id="ees-playlist">
			{t("playlist.error")}
		</div>
	);

	return (
		<div id="ees-playlist">
			<div id="ees-playlist-header">
				<PlaylistCover
					imageURLs={data?.musicData
						.map((track) => track.imageDataPath ?? track.artistData.imageDataPath)
						.filter((x) => x !== null) as string[]|undefined}
					columnCount={3}
					rowCount={3}
					width={210}
					height={210}
				/>
				<div id="ees-playlist-metadata">
					<h1 id="ees-playlist-name">{data?.playlistName}</h1>
					{creatorStub ? (
						<p id="ees-playlist-creator">
							<a href={getUserPage(creatorStub.userName)}>{data?.displayUserName}</a>
						</p>
					) : (
						<p id="ees-playlist-creator">{data?.displayUserName}</p>
					)}
					
					<p id="ees-playlist-date">{data?.createdAt.split("T")[0].replace(/-/g, "/")}</p>
					<div id="ees-playlist-like">
						<button
							type="button"
							id="ees-playlist-like-button"
							className={isLiked ? "ees-liked" : ""}
							onClick={(e) => {
								toggleLiked(e, playlistID, loggedIn, setLiked, setLikeCount);
							}}>
							{
								isLiked ? <FavoriteRoundedIcon /> : <FavoriteBorderRoundedIcon />
							}
						</button>
						<span id="ees-playlist-like-count">{likeCount}</span>
					</div>
				</div>
			</div>
			<h2>{t("general.song", {count: data?.musicData.length})}</h2>
			<TrackContainer
				data={data?.musicData}
				t={t}
				size="large" />
		</div>
	);
}