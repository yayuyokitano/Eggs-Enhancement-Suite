import React, { useEffect, useState } from "react";
import { TFunction } from "react-i18next";
import "./track.scss";
import { createToggleLiked } from "./trackContainer";
import { Incrementer, IncrementerError } from "../sync/itemFetcher";
import { SongData } from "../../../util/wrapper/eggs/artist";
import { songLikeInfo } from "../../../util/wrapper/eggs/evaluation";
import { OffsetList } from "../../../util/wrapper/eggs/util";
import Track from "./track";
import { ExpandMoreRoundedIcon, MoreHorizRoundedIcon } from "../../../util/icons";

interface DynamicTrackContainerParams<T> {
	size:"small"|"normal",
	title:string,
	t:TFunction,
	incrementer:Incrementer<T>,
	convert:(data:OffsetList<T>) => SongData[],
}

export default function DynamicTrackContainer<T>(props:DynamicTrackContainerParams<T>) {
	const { size, t, title, incrementer, convert } = props;
	const [loading, setLoading] = useState(true);
	const [children, setChildren] = useState<SongData[]>([]);
	const [totalCount, setTotalCount] = useState(0);
	const [likedTracks, setLikedTracks] = useState<string[]>([]);
	const [loggedIn, setLoggedIn] = useState(false);

	useEffect(() => {
		incrementer.getPage(false).then(page => {
			setTotalCount(page.totalCount);
			setChildren(convert(page));
			setLoading(false);

			if (!children) return;
    
			songLikeInfo(children.map((track) => track.musicId)).then((likedTracks) => {
				const likedTrackList = likedTracks.data
					.filter((track) => track.isLike)
					.map((track) => track.musicId);
				setLikedTracks(likedTrackList);
				setLoggedIn(true);
			}).catch(() => {
				setLikedTracks([]);
				setLoggedIn(false);
			});
		});
	}, []);

	return (
		<div className="ees-dynamic-track-container-wrapper">
			<h2>{t(title, {count: totalCount})}</h2>
			<Container
				incrementer={incrementer}
				loading={loading}
				data={children}
				size={size}
				likedTracks={likedTracks}
				setLikedTracks={setLikedTracks}
				setChildren={setChildren}
				setTotalCount={setTotalCount}
				convert={convert}
				setLoading={setLoading}
				t={t}
				loggedIn={loggedIn} />
		</div>
	);
}

function Container<T>(props: {
	incrementer:Incrementer<T>,
	loading:boolean, data:SongData[],
	size:"small"|"normal",
	likedTracks:string[],
	setLikedTracks:React.Dispatch<React.SetStateAction<string[]>>,
	t:TFunction, loggedIn:boolean, convert:(data:OffsetList<T>) => SongData[],
	setChildren:React.Dispatch<React.SetStateAction<SongData[]>>,
	setTotalCount:React.Dispatch<React.SetStateAction<number>>,
	setLoading:React.Dispatch<React.SetStateAction<boolean>>,
}) {
	const { incrementer, convert, setChildren, setTotalCount, loading, data, size, likedTracks, setLikedTracks, t, loggedIn, setLoading } = props;

	return (
		<ul className="ees-track-container">
			{data?.map((song, i) => (
				<Track
					key={i}
					track={song}
					size={size}
					z={data.length-i}
					t={t}
					loggedIn={loggedIn}
					isLiked={likedTracks.includes(song.musicId)}
					toggleLiked={createToggleLiked(likedTracks, setLikedTracks)}
					isInQueue={false}
				/>
			))}
			<div className="ees-track-container-expand">
				{loading ? <MoreHorizRoundedIcon /> : (
					<button
						type="button"
						onClick={() => addTracks(incrementer, convert, setChildren, setTotalCount, setLikedTracks, setLoading)}>
						<ExpandMoreRoundedIcon />
					</button>
				)}
			</div>
		</ul>
	);
}

function addTracks<T>(incrementer:Incrementer<T>, convert:(data:OffsetList<T>) => SongData[], setChildren:React.Dispatch<React.SetStateAction<SongData[]>>, setTotalCount:React.Dispatch<React.SetStateAction<number>>, setLikedTracks:React.Dispatch<React.SetStateAction<string[]>>, setLoading:React.Dispatch<React.SetStateAction<boolean>>) {
	setLoading(true);
	incrementer.getPage(false).then(page => {
		const songData = convert(page);
		setTotalCount(page.totalCount);
		setChildren((oldChildren) => [
			...oldChildren,
			...(songData.filter(item => !oldChildren.some(child => child.musicId === item.musicId)))
		]);
		setLoading(false);

		if (!page.totalCount) return;
    
		songLikeInfo(songData.map((track) => track.musicId)).then((likedTracks) => {
			const likedTrackList = likedTracks.data
				.filter((track) => track.isLike)
				.map((track) => track.musicId);
			setLikedTracks((oldLikes) => [
				...oldLikes,
				...likedTrackList
			]);
		}).catch(() => {
			//do nothing, there was just no liked tracks
		});

	}).catch(err => {
		console.error(err);
		if (err instanceof Error && err.message === IncrementerError.NoItemsError) {
			incrementer.kill();
		}
	});
}
