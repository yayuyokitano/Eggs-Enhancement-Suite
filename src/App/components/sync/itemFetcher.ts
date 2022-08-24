import EventEmitter from "events";
import TypedEmitter from "typed-emitter";
import { PlaylistWrapper } from "util/wrapper/eggshellver/playlist";
import { UserStub } from "../../../util/wrapper/eggshellver/util";

const sleep = (ms:number) => new Promise((resolve) => setTimeout(resolve, ms));

interface SingleItem<T> {
  item: T;
  totalCount:number;
}

interface SyncItems<T> {
  syncItems:T[];
  totalCount:number;
  offset:string;
}

export enum IncrementerError {
  CountDecreaseError = "CountDecreaseError",
  NoItemsError = "NoItemsError",
}

class Incrementer<T> {

  private eggsGet:EggsGet<T>;
  private offset = "";
  private limit:number;
  private prevCount = -1;
  private ready:Promise<void>; //rate limit avoider

  constructor(eggsGet:EggsGet<T>, limit:number) {
    this.eggsGet = eggsGet;
    this.limit = limit;
    this.ready = new Promise(async(resolve) => {resolve()});
  }

  public async getPage() {
    await this.ready;
    const items = await this.eggsGet(this.offset, this.limit);
    this.offset = items.offset;
    if (this.prevCount === -1) this.prevCount = items.totalCount;
    if (items.totalCount === 0) throw new Error(IncrementerError.NoItemsError);
    if (items.totalCount < this.prevCount) throw new Error(IncrementerError.CountDecreaseError);

    items.syncItems = items.syncItems.slice(items.totalCount - this.prevCount);
    this.prevCount = items.totalCount;
    this.ready = new Promise(async(resolve) => {await sleep(800 + (200 * Math.random())); resolve()});
    return items;
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
type EggsGet<T> = (offset:string, limit:number) => Promise<SyncItems<T>>;

export default class ItemFetcher<T> extends (EventEmitter as new () => TypedEmitter<FetcherEmitters>) {

  private incrementer: Incrementer<T>;
  private eggshellverGet:EggshellverGet<T>;
  private eggsID:string;
  private limit = 100;
  private count = 0;
  private putFunction:(targets:T[]) => Promise<string>;
  private postFunction:(targets:T[]) => Promise<string>;
  private shouldFullScan:boolean;

  constructor(
    eggsID:string,
    eggshellverGet:EggshellverGet<T>,
    eggsGet:EggsGet<T>,
    putFunction:(targetIDs:T[]) => Promise<string>,
    postFunction:(targetIDs:T[]) => Promise<string>,
    shouldFullScan:boolean,
  ) {
    super();
    this.eggshellverGet = eggshellverGet;
    this.eggsID = eggsID;
    this.incrementer = new Incrementer(eggsGet, this.limit);
    this.putFunction = putFunction;
    this.postFunction = postFunction;
    this.shouldFullScan = shouldFullScan;
    this.start()
  }

  private async start() {
    const {eggs, shouldFullscan} = await this.attemptPartialScan();
    if (!shouldFullscan) return;
    await this.completeFullScan(eggs);
  }

  private async completeFullScan(eggs:SyncItems<T>) {

    while (this.count < eggs.totalCount) {
      try {
        this.emitProgress(this.count, eggs.totalCount, FetchLabel.FETCHING_FULL);
        const newEggs = await this.incrementer.getPage();
        eggs.syncItems.push(...newEggs.syncItems);
        eggs.offset = newEggs.offset;
        eggs.totalCount = newEggs.totalCount;
        this.count += this.limit;
      } catch(err) {
        if (err instanceof Error && err.message === IncrementerError.NoItemsError) {
          break;
        }
        console.error(err);
        this.emitError(err);
        return;
      }
    }

    try {
      await this.putFunction(eggs.syncItems);
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
      return {eggs: {syncItems: [], totalCount: 0, offset: ""}, shouldFullscan: false};
    }

    const eggs = await this.incrementer.getPage();
    this.count += this.limit
    if (eggshellver.totalCount === 0 || this.shouldFullScan) return {eggs, shouldFullscan: true};
    
    while (eggs.totalCount - this.count >= eggshellver.totalCount) {
      try {
        this.emitProgress(this.count, eggs.totalCount - eggshellver.totalCount, FetchLabel.FETCHING_PARTIAL);
        const newEggs = await this.incrementer.getPage();
        eggs.syncItems.push(...newEggs.syncItems);
        eggs.offset = newEggs.offset;
        eggs.totalCount = newEggs.totalCount;
        this.count += this.limit;
      } catch(err) {
        if (err instanceof Error && err.message === IncrementerError.NoItemsError) {
          this.emitComplete();
          return {eggs, shouldFullscan: true};
        }
        console.error(err);
        this.emitError(err);
        return {eggs, shouldFullscan: true};
      }
    }

    let shouldFullscan = false;

    //yes this is cursed im sorry
    if (eggs.syncItems.filter((e) => e === eggshellver.item
      || ((e as UserStub).hasOwnProperty("userName")
      && (e as UserStub).userName === (eggshellver.item as UserStub).userName)
      || ((e as PlaylistWrapper).hasOwnProperty("playlistID")
      && (e as PlaylistWrapper).playlistID === (eggshellver.item as PlaylistWrapper).playlistID))
    .length === 0) {
      shouldFullscan = true;
      return {eggs, shouldFullscan};
    }

    try {
      await this.postFunction(eggs.syncItems);
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
