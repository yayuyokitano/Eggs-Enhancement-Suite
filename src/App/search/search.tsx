import Carousel from "../../App/components/carousel/carousel";
import { ArtistList, PlaylistList } from "../../App/components/carousel/generators";
import { TFunction } from "react-i18next";
import { Incrementer } from "../../App/components/sync/itemFetcher";
import { currySearchArtistsWrapped, currySearchPlaylistsWrapped, currySearchTracksWrapped } from "../../util/wrapper/eggs/search";
import "./search.scss";
import DynamicTrackContainer from "../../App/components/track/dynamicTrackContainer";
import { List } from "../../util/wrapper/eggs/util";
import { SongData } from "../../util/wrapper/eggs/artist";
import { ArtistModalList, PlaylistModalList } from "../components/listModal/modalGenerators";

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
				ModalElementList={ArtistModalList}
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
				ModalElementList={PlaylistModalList}
			/>
			<DynamicTrackContainer
				size="medium"
				title="trackResult"
				t={t}
				incrementer={new Incrementer(currySearchTracksWrapped(searchKeyword), 30)}
				convert={(e:List<SongData>) => e.data} />
		</div>
	);
}
