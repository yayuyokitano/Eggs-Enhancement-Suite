import { Incrementer } from "../../App/components/sync/itemFetcher";
import EventEmitter from "events";
import TypedEmitter from "typed-emitter";

import { SongData } from "../../util/wrapper/eggs/artist";
import { SongDataWIndex } from "../components/track/track";
import { ChatMessage } from "../../util/socketConnection";
import { UserStub } from "../../util/wrapper/eggshellver/util";

type PlaybackEmitters = {
  update: () => void;
	updateChat: () => void;
	updateSuggestions: () => void;
	updateSettings: () => void;
}

export interface Suggestion {
	song: SongData|null;
	user: UserStub;
	updated: Date;
}

export default abstract class PlaybackController extends (EventEmitter as new () => TypedEmitter<PlaybackEmitters>) {

	abstract setPlayback(initialQueue:SongData[], initialElement:SongData): void;

	abstract setPlaybackDynamic(initialQueue:SongData[], incrementer:Incrementer<SongData>): void;

	abstract play(): void;

	abstract blockUser(eggsID:string): void;

	abstract unblockUser(eggsID:string): void;

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

	abstract sendChatMessage(message:string): void;

	abstract set volume(volume:number);

	abstract set scrobbleInfo(scrobble:{artist:string, track:string, album:string});

	abstract set title(title:string);

	abstract set suggestion(suggestion:SongData|null);

	abstract set playSuggestions(playSuggestions:boolean);

	abstract get playSuggestions(): boolean;

	abstract get suggestions(): Suggestion[] | undefined;

	abstract get title(): string;

	abstract get isPublic(): boolean;

	abstract get current(): SongData | undefined;

	abstract get currentTime(): number | undefined;

	abstract get duration(): number | undefined;

	abstract get isPlaying(): boolean | undefined;

	abstract get priorityQueue(): SongDataWIndex[] | undefined;

	abstract get mainQueue(): SongDataWIndex[] | undefined;

	abstract get all(): SongDataWIndex[] | undefined;

	abstract get chatMessages(): ChatMessage[] | undefined;
}