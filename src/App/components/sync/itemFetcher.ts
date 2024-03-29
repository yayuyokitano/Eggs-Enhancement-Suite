import EventEmitter from "events";
import TypedEmitter from "typed-emitter";
import { OffsetList } from "../../../util/wrapper/eggs/util";
import { sleep } from "../../../util/util";
import { PlaylistWrapper } from "../../../util/wrapper/eggshellver/playlist";
import { UserStub } from "../../../util/wrapper/eggshellver/util";



interface SingleItem<T> {
  item: T;
  totalCount:number;
}

export enum IncrementerError {
  CountDecreaseError = "CountDecreaseError",
  NoItemsError = "NoItemsError",
	EmptyPage = "EmptyPageError",
}

export class Incrementer<T> {

	private eggsGet:EggsGet<T>;
	private offset = "";
	private limit:number;
	private prevCount = -1;
	private ready:Promise<void>; //rate limit avoider
	private alive = true;
	private oneRequest:boolean;
	public fetching = false;

	constructor(eggsGet:EggsGet<T>, limit:number, oneRequest?:boolean) {
		this.eggsGet = eggsGet;
		this.limit = limit;
		this.oneRequest = oneRequest ?? false;
		this.ready = Promise.resolve();
	}

	public async getPage(options:{
		shouldCompare:boolean,
		ignoreNoItemError:boolean,
	} = {
		shouldCompare: true,
		ignoreNoItemError: false,
	}) {
		this.fetching = true;
		if (!this.alive) throw new Error(IncrementerError.NoItemsError);
		await this.ready;
		let items:OffsetList<T>;
		try {
			items = await this.eggsGet(this.offset, this.limit);
		} catch(err) {
			if (err instanceof Error && err.message === IncrementerError.EmptyPage) {
				this.fetching = false;
				this.offset += this.limit;
			}
			throw err;
		}
		
		this.offset = items.offset;
		if (this.prevCount === -1) this.prevCount = items.totalCount;
		if (items.totalCount === 0 && options.ignoreNoItemError) throw new Error(IncrementerError.NoItemsError);
		if (options.shouldCompare && items.totalCount < this.prevCount) throw new Error(IncrementerError.CountDecreaseError);
		if (this.oneRequest) this.kill();

		if (options.shouldCompare) {
			items.data = items.data.slice(items.totalCount - this.prevCount);
		}
		
		this.prevCount = items.totalCount;
		this.ready = Promise.resolve(sleep(800 + (200 * Math.random())));
		this.fetching = false;
		return items;
	}

	public kill() {
		this.alive = false;
	}

	public get isAlive() {
		return this.alive;
	}

}

export enum FetchLabel {
  FETCHING_PARTIAL,
  FETCHING_FULL,
}

interface FetchProgress {
  total:number;
  current:number;
  percentage:number;
  label:FetchLabel;
}

type FetcherEmitters = {
  complete: () => void;
  update: (progress:FetchProgress) => void;
  error: (error:Error) => void;
}

type EggshellverGet<T> = (eggsID:string) => Promise<SingleItem<T>>;
export type EggsGet<T> = (offset:string, limit:number) => Promise<OffsetList<T>>;

export default class ItemFetcher<T> extends (EventEmitter as new () => TypedEmitter<FetcherEmitters>) {

	private incrementer: Incrementer<T>;
	private eggshellverGet:EggshellverGet<T>;
	private eggsID:string;
	private limit = 100;
	private count = 0;
	private putFunction:(targets:T[]) => Promise<number>;
	private postFunction:(targets:T[]) => Promise<number>;
	private shouldFullScan:boolean;

	constructor(
		eggsID:string,
		eggshellverGet:EggshellverGet<T>,
		eggsGet:EggsGet<T>,
		putFunction:(targetIDs:T[]) => Promise<number>,
		postFunction:(targetIDs:T[]) => Promise<number>,
		shouldFullScan:boolean,
	) {
		super();
		this.eggshellverGet = eggshellverGet;
		this.eggsID = eggsID;
		this.incrementer = new Incrementer(eggsGet, this.limit);
		this.putFunction = putFunction;
		this.postFunction = postFunction;
		this.shouldFullScan = shouldFullScan;
		this.start();
	}

	private async start() {
		const {eggs, shouldFullscan} = await this.attemptPartialScan();
		if (!shouldFullscan) return;
		await this.completeFullScan(eggs);
	}

	private async completeFullScan(eggs:OffsetList<T>) {
		while (this.count < eggs.totalCount) {
			try {
				this.emitProgress(this.count, eggs.totalCount, FetchLabel.FETCHING_FULL);
				const newEggs = await this.incrementer.getPage();
				eggs.data.push(...newEggs.data);
				eggs.offset = newEggs.offset;
				eggs.totalCount = newEggs.totalCount;
				this.count += this.limit;
			} catch(err) {
				if (err instanceof Error && err.message === IncrementerError.NoItemsError) {
					try {
						await this.putFunction(eggs.data);
						this.emitComplete();
					} catch(err) {
						console.error(err);
						this.emitError(err);
					}
					break;
				}
				console.error(err);
				this.emitError(err);
				return;
			}
		}

		try {
			await this.putFunction(eggs.data);
			this.emitComplete();
		} catch(err) {
			console.error(err);
			this.emitError(err);
		}
	}

	private async attemptPartialScan() {
		let eggshellver:SingleItem<T>;
		try {
			eggshellver = await this.eggshellverGet(this.eggsID);
		} catch(err) {
			console.error(err);
			this.emitError(err);
			return {eggs: {data: [], totalCount: 0, offset: ""}, shouldFullscan: false};
		}

		let eggs:OffsetList<T>;
		try {
			eggs = await this.incrementer.getPage();
		} catch(err) {
			return {eggs: {data: [], totalCount: 0, offset: ""}, shouldFullscan: true};
		}
    
		this.count += this.limit;
		if (this.shouldFullScan) return {eggs, shouldFullscan: true};
    
		while (eggs.totalCount - this.count >= eggshellver.totalCount) {
			try {
				this.emitProgress(this.count, eggs.totalCount - eggshellver.totalCount, FetchLabel.FETCHING_PARTIAL);
				const newEggs = await this.incrementer.getPage();
				eggs.data.push(...newEggs.data);
				eggs.offset = newEggs.offset;
				eggs.totalCount = newEggs.totalCount;
				this.count += this.limit;
			} catch(err) {
				if (err instanceof Error && err.message === IncrementerError.NoItemsError) {
					return {eggs, shouldFullscan: true};
				}
				console.error(err);
				this.emitError(err);
				return {eggs, shouldFullscan: true};
			}
		}

		let shouldFullscan = false;

		if (eggshellver.item && eggs.data.filter((e) => fetchFilter(e, eggshellver.item)).length === 0) {
			shouldFullscan = true;
			return {eggs, shouldFullscan};
		}

		try {
			await this.postFunction(eggs.data);
			this.emitComplete();
		} catch(err) {
			console.error(err);
			this.emitError(err);
			shouldFullscan = true;
		}

		return {eggs, shouldFullscan};
	}

	private emitProgress(current:number, total:number, label:FetchLabel) {
		const percentage = Math.floor((current / total) * 100);
		this.emit("update", {
			total,
			current,
			percentage,
			label,
		});
	}

	private emitComplete() {
		this.emit("complete");
	}

	private emitError(error:unknown) {
		if (error instanceof Error) {
			this.emit("error", error);
			return;
		}
		if(typeof error === "string") {
			this.emit("error", new Error(error));
			return;
		}
		this.emit("error", new Error(JSON.stringify(error)));
	}
}

//yes this is cursed im sorry
function fetchFilter<T>(e:T, item:T) {
	if (e === item) return true;
	if (typeof e === "string") return false;
	if ("userName" in e && (e as UserStub).userName === (item as UserStub).userName) return true;
	if ("playlistID" in e && (e as PlaylistWrapper).playlistID === (item as PlaylistWrapper).playlistID) return true;
	return false;
}
