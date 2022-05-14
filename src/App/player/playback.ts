import { SongData } from "../../util/wrapper/eggs/artist";

export function setPlayback(track:SongData) {
  console.log(`Would've started playback of ${track.musicTitle} by ${track.artistData.displayName} from source ${track.musicDataPath} :)`);
}