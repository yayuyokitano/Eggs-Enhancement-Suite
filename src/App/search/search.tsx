import Carousel from "../../App/components/carousel/carousel";
import { ArtistList, PlaylistList } from "../../App/components/carousel/generators";
import { TFunction } from "react-i18next";
import { Incrementer } from "../../App/components/sync/itemFetcher";
import { currySearchArtistsWrapped, currySearchPlaylistsWrapped } from "../../util/wrapper/eggs/search";
import "./search.scss";

export default function Search(t:TFunction) {
	const searchKeyword = new URLSearchParams(window.location.search).get("searchKeyword");
	if (!searchKeyword) return <p>{t("noKeyword")}</p>;

	return (
		<div className="ees-search-wrapper ttl_page">
			<h1>{t("header", {searchKeyword})}</h1>
			<Carousel
				width={205}
				size="small"
				type="artist"
				t={t}
				title="artistResult"
				init={[]}
				ElementList={ArtistList}
				incrementer={new Incrementer(currySearchArtistsWrapped(searchKeyword), 30)}
				uniquePropName="artistName"
				eggsGetSongCurry="curryEggsArtistSearchPlayback"
				payload={searchKeyword}
			/>
			<Carousel
				width={204}
				size="small"
				type="playlist"
				t={t}
				title="playlistResult"
				init={[]}
				ElementList={PlaylistList}
				incrementer={new Incrementer(currySearchPlaylistsWrapped(searchKeyword), 30)}
				uniquePropName="playlistId"
			/>
		</div>
	);
}
