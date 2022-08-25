import { TFunction } from "react-i18next";
import { Playlist, PlaylistPartial } from "../../util/wrapper/eggs/playlists";
import { PlaylistCover } from "./playlistcover";
import "./playlistContainer.scss";
import { getTimeSince } from "../../util/util";

function Playlist(props:{playlist: PlaylistPartial, t: TFunction, onPlaylistClick:(playlist:PlaylistPartial)=>void}) {
	const { playlist, t, onPlaylistClick } = props;
	return (
		<li
			className="ees-playlist"
			onClick={() => {onPlaylistClick(playlist);}}>
			<PlaylistCover
				imageURLs={playlist.arrayOfImageDataPath.split(",")}
				columnCount={2}
				rowCount={2}
				width={100}
				height={100}
			/>
			<div className="ees-playlist-metadata">
				<span className="ees-playlist-name">{playlist.playlistName}</span>
				<span className="ees-playlist-lastmodified">{t("general.lastModified") + getTimeSince(playlist.updatedAt, t)}</span>
			</div>
		</li>
	);
}

export function PlaylistContainer(props:{t:TFunction, playlists:PlaylistPartial[], onPlaylistClick:(playlist:PlaylistPartial)=>void, loadingMore:boolean}) {
	const {t, playlists, onPlaylistClick, loadingMore} = props;

	return (
		<ul
			className="ees-playlist-container"
		>
			{
				playlists.map((playlist) => (
					<Playlist
						key={playlist.playlistId}
						playlist={playlist}
						t={t}
						onPlaylistClick={onPlaylistClick} />
				))
			}
			{
				loadingMore ?
					<p>{t("general.loading")}</p> :
					<></>
			}
		</ul>
	);
}