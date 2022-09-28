import { Incrementer } from "../../App/components/sync/itemFetcher";
import EventEmitter from "events";
import TypedEmitter from "typed-emitter";

import { SongData } from "../../util/wrapper/eggs/artist";
import { SongDataWIndex } from "../components/track/track";

type PlaybackEmitters = {
  update: () => void;
}

export default abstract class PlaybackController extends (EventEmitter as new () => TypedEmitter<PlaybackEmitters>) {

	abstract suggest(song:SongData): void;

	abstract setPlayback(initialQueue:SongData[], initialElement:SongData): void;

	abstract setPlaybackDynamic(initialQueue:SongData[], incrementer:Incrementer<SongData>): void;

	abstract play(): void;

	abstract pause(): void;

	abstract next(destination?: boolean): void;

	abstract previous(): void;

	abstract playNext(track:SongData): void;

	abstract addToQueue(track:SongData): void;

	abstract removeFromQueue(trackIndex:number): void;

	abstract setCurrentTime(value:number): void;

	abstract skipTo(n:number): void;

	abstract toggleShuffle(): void;

	abstract cycleRepeat(): void;

	abstract closeConnection(): void;

	abstract set volume(volume:number);

	abstract set scrobbleInfo(scrobble:{artist:string, track:string, album:string});

	abstract set title(title:string);

	abstract get title(): string;

	abstract get isPublic(): boolean;

	abstract get current(): SongData | undefined;

	abstract get currentTime(): number | undefined;

	abstract get duration(): number | undefined;

	abstract get isPlaying(): boolean | undefined;

	abstract get priorityQueue(): SongDataWIndex[] | undefined;

	abstract get mainQueue(): SongDataWIndex[] | undefined;

	abstract get all(): SongDataWIndex[] | undefined;
}