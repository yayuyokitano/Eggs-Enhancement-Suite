import Carousel from "../../App/components/carousel/carousel";
import { ArtistList } from "../../App/components/carousel/generators";
import { TFunction } from "react-i18next";
import { Incrementer } from "../../App/components/sync/itemFetcher";
import { currySearchPrefectureArtistsWrapped } from "../../util/wrapper/eggs/search";
import "./search.scss";
import { ArtistModalList } from "../components/listModal/modalGenerators";
import { prefectures } from "../../util/util";

export default function SearchArea(t:TFunction) {
	const urlSplit = window.location.pathname.split("/");
	if (urlSplit.length < 4) return <p>{t("general.error")}</p>;
	const prefecture = urlSplit[3];
	if (!prefecture) return <p>{t("general.error")}</p>;

	return (
		<div className="ees-search-wrapper ttl_page">
			<h1>{t("header", {searchKeyword: t(`global:prefecture.${prefectures.indexOf(prefecture) + 1}`)})}</h1>
			<Carousel
				width={205}
				size="small"
				type="artist"
				t={t}
				title="artistResult"
				init={[]}
				ElementList={ArtistList}
				incrementer={new Incrementer(currySearchPrefectureArtistsWrapped(prefecture), 30)}
				uniquePropName="artistName"
				eggsGetSongCurry="curryEggsArtistSearchPrefecturePlayback"
				payload={prefecture}
				ModalElementList={ArtistModalList}
			/>
		</div>
	);
}
