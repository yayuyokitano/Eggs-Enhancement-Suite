import { TFunction } from "react-i18next";
import { curryGenreArtistRankingWrapped, musicRanking, RankingSong, RankingType, TimePeriod } from "../../util/wrapper/eggs/ranking";
import "../ranking/ranking.scss";
import Carousel from "../components/carousel/carousel";
import { RankingArtistList } from "../components/carousel/generators";
import { Incrementer } from "../components/sync/itemFetcher";
import React, { useEffect, useState } from "react";
import { List } from "../../util/wrapper/eggs/util";
import RankTrackContainer from "../components/track/rankTrackContainer";
import { RankingArtistModalList } from "../components/listModal/modalGenerators";

export type Path = [RankingType, TimePeriod];

export default function SearchGenre(t:TFunction) {
	
	const [path, setPath] = useState<Path>(["artist", "daily"]);
	const pathSplit = window.location.pathname.split("/");
	if (pathSplit.length < 4) return <p>{t("general.error")}</p>;
	const genre = window.location.pathname.split("/")[3];
	if (!genre?.startsWith("fg")) return <p>{t("general.error")}</p>;
	const genreNum = parseInt(genre.slice(2)); 

	return (
		<div className="ees-ranking-wrapper">
			<h1 className="ttl_page">{t("ranking.genreRanking", {genre: t(`genre.${genreNum}`)})}</h1>
			<ul className="ranking_category">
				<ConditionalSourceTypeLink
					t={t}
					destination="artist"
					path={path}
					setPath={setPath}>{t("general.artist", {count:2})}</ConditionalSourceTypeLink>
				<ConditionalSourceTypeLink
					t={t}
					destination="song"
					path={path}
					setPath={setPath}>{t("general.song", {count:2})}</ConditionalSourceTypeLink>
				<ConditionalSourceTypeLink
					t={t}
					destination="youtube"
					path={path}
					setPath={setPath}>{t("ranking.youtube")}</ConditionalSourceTypeLink>
			</ul>
			<ul className="dayweekNav">
				<ConditionalTimePeriodLink
					t={t}
					destination="daily"
					path={path}
					setPath={setPath}>{t("ranking.daily")}</ConditionalTimePeriodLink>
				<ConditionalTimePeriodLink
					t={t}
					destination="weekly"
					path={path}
					setPath={setPath}>{t("ranking.weekly")}</ConditionalTimePeriodLink>
			</ul>
			<RankingContent
				t={t}
				path={path}
				genreNum={genreNum} />
		</div>
	);
}

function RankingContent(props: {t:TFunction, path:Path, genreNum:number}) {
	const {path, t, genreNum} = props;

	if (path[0] === "artist") {
		return <Carousel
			width={205}
			size="medium"
			type="artist"
			t={t}
			title="ranking.ranking"
			init={[]}
			ElementList={RankingArtistList}
			incrementer={new Incrementer(curryGenreArtistRankingWrapped(path[1], genreNum), 30)}
			uniquePropName="artistId"
			eggsGetSongCurry="curryEggsGenreArtistRankingPlayback"
			payload={path[1] + "//" + genreNum.toString()}
			ModalElementList={RankingArtistModalList}
			path={path}
		/>;
	}
	return <SongRanking
		t={t}
		path={path}/>;
}

function SongRanking(props: {t:TFunction, path:Path}) {
	const {path, t} = props;
	const [data, setData] = useState<List<RankingSong>>();
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		setLoading(true);
		musicRanking(Number(path[0] === "youtube") + 1, path[1]).then(data => {
			setData(data);
			setLoading(false);
		});
	}, [path]);

	if (loading) return <p>{t("general.loading")}</p>;
	return <RankTrackContainer
		data={data?.data}
		t={t}
		size="large" />;
}

function ConditionalSourceTypeLink(props:{t:TFunction, destination:RankingType, children:string, path:Path, setPath:React.Dispatch<React.SetStateAction<Path>>}) {
	const {t, destination, children, path, setPath} = props;
	
	return (
		<li>
			<ConditionalLink
				t={t}
				destination={[destination, path[1]]}
				path={path}
				setPath={setPath}>{children}</ConditionalLink>
		</li>
	);
}

function ConditionalTimePeriodLink(props:{t:TFunction, destination:TimePeriod, children:string, path:Path, setPath:React.Dispatch<React.SetStateAction<Path>>}) {
	const {t, destination, children, path, setPath} = props;
	
	return (
		<li>
			<ConditionalLink
				t={t}
				destination={[path[0], destination]}
				path={path}
				setPath={setPath}>{children}</ConditionalLink>
		</li>
	);
}

function ConditionalLink(props:{t:TFunction, destination:Path, children:string, path:Path, setPath:React.Dispatch<React.SetStateAction<Path>>}) {
	const {t, destination, children, path, setPath} = props;
	if (typeof children !== "string") return <span>{t("general.error")}</span>;

	if (destination[0] === path[0] && destination[1] == path[1]) return <span>{children}</span>;
	return <a
		href="javascript:void 0"
		onClick={() => {setPath(destination);}}>{children}</a>;
}
