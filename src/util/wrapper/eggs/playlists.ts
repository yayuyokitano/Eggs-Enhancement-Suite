import { SongData } from "./artist";
import { eggsRequest } from "./request"

export interface Playlist {
  createdAt: string,
  displayUserName: string,
  isPrivate: number,
  musicData: SongData[],
  playlistId: string,
  playlistName: string,
  updatedAt: string,
  userId: number
}

export interface PlaylistPartial {
  arrayOfArtistId:string;
  arrayOfImageDataPath:string;
  arrayOfMusicId: string;
  createdAt: string;
  isPrivate: number;
  playlistId: string;
  playlistName: string;
  updatedAt: string;
  userId: number;
}

interface PlaylistPartials {
  data: PlaylistPartial[];
  offsetHash: string;
  totalCount: number;
}

interface Playlists {
  data: Playlist[];
  totalCount: number;
}

export async function playlist(playlistID:string) {
  return eggsRequest(`playlists/playlists/${playlistID}`, {}, { isAuthorizedRequest: true }) as Promise<Playlists>;
}

export async function getPlaylists(limit:number, offsetHash?:string) {
  let qs = `limit=${limit}`;
  if (offsetHash) qs += `&offsetHash=${offsetHash}`;
  return eggsRequest(`playlists/playlists?${qs}`, {}, { isAuthorizedRequest: true }) as Promise<PlaylistPartials>;
}

interface PlaylistModifier {
  playlistId: string;
  playlistName: string;
  arrayOfArtistId: string;
  arrayOfMusicId: string;
  isPrivate: number;
}

export async function playlistAdd(playlist:PlaylistPartial, song:{artistId:number, musicId:string}) {
  const playlistModifier = {
    playlistId: playlist.playlistId,
    playlistName: playlist.playlistName,
    arrayOfArtistId: playlist.arrayOfArtistId + `,${song.artistId}`,
    arrayOfMusicId: playlist.arrayOfMusicId + `,${song.musicId}`,
    isPrivate: playlist.isPrivate,
  }
  return eggsRequest(`playlists/playlists`, playlistModifier, { isPutRequest: true, isAuthorizedRequest: true }) as Promise<Playlist>;
}
