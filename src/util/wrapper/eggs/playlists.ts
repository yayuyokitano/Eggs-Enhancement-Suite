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

interface Playlists {
  data: Playlist[],
  totalCount: number
}

export async function playlist(playlistID:string) {
  return eggsRequest(`playlists/playlists/${playlistID}`, {}, {isAuthorizedRequest: true}) as Promise<Playlists>;
}