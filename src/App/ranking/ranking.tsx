import { TFunction } from "react-i18next";
import { curryArtistRankingWrapped, musicRanking, RankingSong, RankingType, TimePeriod } from "../../util/wrapper/eggs/ranking";
import "./ranking.scss";
import Carousel from "../components/carousel/carousel";
import { RankingArtistList } from "../components/carousel/generators";
import { Incrementer } from "../components/sync/itemFetcher";
import { useEffect, useState } from "react";
import { List } from "../../util/wrapper/eggs/util";
import RankTrackContainer from "../components/track/rankTrackContainer";
import { RankingArtistModalList } from "../components/listModal/modalGenerators";

export default function Ranking(t:TFunction) {const path = window.location.pathname.split("/").slice(2);
	if (path.length !== 2) return <p>{t("general.error")}</p>;
	const timePeriod = path[1];
	if (timePeriod !== "daily" && timePeriod !== "weekly") return <p>{t("general.error")}</p>;
	const type = path[0];
	if (type !== "artist" && type !== "song" && type !== "youtube") return <p>{t("general.error")}</p>;

	return (
		<div className="ees-ranking-wrapper">
			<h1 className="ttl_page">{t("ranking.ranking")}</h1>
			<ul className="ranking_category">
				<ConditionalSourceTypeLink
					t={t}
					hrefName="/ranking/artist">{t("general.artist", {count:2})}</ConditionalSourceTypeLink>
				<ConditionalSourceTypeLink
					t={t}
					hrefName="/ranking/song">{t("general.song", {count:2})}</ConditionalSourceTypeLink>
				<ConditionalSourceTypeLink
					t={t}
					hrefName="/ranking/youtube">{t("ranking.youtube")}</ConditionalSourceTypeLink>
			</ul>
			<ul className="dayweekNav">
				<ConditionalTimePeriodLink
					t={t}
					hrefName="/ranking//daily">{t("ranking.daily")}</ConditionalTimePeriodLink>
				<ConditionalTimePeriodLink
					t={t}
					hrefName="/ranking//weekly">{t("ranking.weekly")}</ConditionalTimePeriodLink>
			</ul>
			<RankingContent
				timePeriod={timePeriod}
				type={type}
				t={t} />
		</div>
	);
}

function RankingContent(props: {timePeriod:TimePeriod, type:RankingType, t:TFunction}) {
	const {timePeriod, type, t} = props;

	if (type === "artist") {
		return <Carousel
			width={205}
			size="medium"
			type="artist"
			t={t}
			title="ranking.ranking"
			init={[]}
			ElementList={RankingArtistList}
			incrementer={new Incrementer(curryArtistRankingWrapped(timePeriod), 30)}
			uniquePropName="artistId"
			eggsGetSongCurry="curryEggsArtistRankingPlayback"
			payload={timePeriod}
			ModalElementList={RankingArtistModalList}
		/>;
	}
	return <SongRanking
		timePeriod={timePeriod}
		type={type}
		t={t}/>;
}

function SongRanking(props: {timePeriod:TimePeriod, type:"song"|"youtube", t:TFunction}) {
	const {timePeriod, type, t} = props;
	const [data, setData] = useState<List<RankingSong>>();
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		musicRanking(Number(type === "youtube") + 1, timePeriod).then(data => {
			setData(data);
			setLoading(false);
		});
	}, []);

	if (loading) return <p>{t("general.loading")}</p>;
	return <RankTrackContainer
		data={data?.data}
		t={t}
		size="large" />;
}

function ConditionalSourceTypeLink(props:{t:TFunction, hrefName:string, children:string}) {
	const {t, hrefName, children} = props;
	const hrefSplit = hrefName.split("/");
	const curSplit = window.location.pathname.split("/");
	if (hrefSplit.length < 3 || curSplit.length < 4) return <span>{t("general.error")}</span>;
	return (
		<li>
			<ConditionalLink
				t={t}
				hrefName={`${hrefName}/${curSplit[3]}`}>{children}</ConditionalLink>
		</li>
	);
}

function ConditionalTimePeriodLink(props:{t:TFunction, hrefName:string, children:string}) {
	const {t, hrefName, children} = props;
	const hrefSplit = hrefName.split("/");
	const curSplit = window.location.pathname.split("/");
	if (hrefSplit.length < 4 || curSplit.length < 4 || hrefSplit[2] !== "") return <span>{t("general.error")}</span>;
	return (
		<li>
			<ConditionalLink
				t={t}
				hrefName={`${hrefSplit.slice(0,2).join("/")}/${curSplit[2]}/${hrefSplit[3]}`}>{children}</ConditionalLink>
		</li>
	);
}

function ConditionalLink(props:{t:TFunction, hrefName:string, children:string}) {
	const {t, hrefName, children} = props;
	if (typeof children !== "string") return <span>{t("general.error")}</span>;

	if (hrefName === window.location.pathname) return <span>{children}</span>;
	return <a href={hrefName}>{children}</a>;
}
