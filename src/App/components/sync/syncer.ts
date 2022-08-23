import { TFunction } from "react-i18next";
import { getEggsPlaylistsWrapped } from "../../../util/wrapper/eggs/playlists";
import { getEggshellverPlaylistsWrapped, PlaylistWrapper, postPlaylists, putPlaylists } from "../../../util/wrapper/eggshellver/playlist";
import { getEggsPlaylistLikesWrapped, getEggsTrackLikesWrapped } from "../../../util/wrapper/eggs/evaluation";
import { getEggsFollowsWrapped, profile } from "../../../util/wrapper/eggs/users";
import { getEggshellverPlaylistLikesWrapped, getEggshellverTrackLikesWrapped, postLikes, putLikes } from "../../../util/wrapper/eggshellver/like";
import ItemFetcher, { FetchLabel } from "./itemFetcher";
import { getEggshellverFollowsWrapped, postFollows, putFollows } from "../../../util/wrapper/eggshellver/follow";
import { UserStub } from "../../../util/wrapper/eggshellver/util";

export default class Syncer {

  private t:TFunction;
  private statusElement:HTMLParagraphElement;
  private fullProgress:HTMLProgressElement;
  private partProgress:HTMLProgressElement;
  private syncButton:HTMLButtonElement;
  private eggsID:string;
  private completedParts = 0;
  private totalParts = 4;
  private ready:Promise<Boolean>
  
  constructor(t:TFunction) {
    this.t = t;
    this.syncButton = document.getElementById("ees-sync-button") as HTMLButtonElement;
    this.statusElement = document.getElementById("ees-sync-status") as HTMLParagraphElement;
    this.fullProgress = document.getElementById("ees-sync-progress-full") as HTMLProgressElement;
    this.partProgress = document.getElementById("ees-sync-progress-part") as HTMLProgressElement;
    this.eggsID = "";
    this.ready = new Promise(async(resolve) => {
      const user = await profile()
      this.eggsID = user.data.userName;
      resolve(true);
    });
  }

  public async scan() {
    await this.ready;

    const likeScanSuccess = await this.scanTrackLikes();
    if (!likeScanSuccess) {
      this.displayError()
      return;
    }

    const playlistLikeScanSuccess = await this.scanPlaylistLikes();
    if (!playlistLikeScanSuccess) {
      this.displayError()
      return;
    };

    const playlistScanSuccess = await this.scanPlaylists();
    if (!playlistScanSuccess) {
      this.displayError()
      return;
    };

    const followScanSuccess = await this.scanFollows();
    if (!followScanSuccess) {
      this.displayError()
      return;
    };

    this.completeScan();
  }

  private async scanFollows() {
    const fetcher = new ItemFetcher<UserStub>(
      this.eggsID,
      getEggshellverFollowsWrapped,
      getEggsFollowsWrapped,
      putFollows,
      postFollows,
    );
    return this.handleFetcher(fetcher, "follows");
  }

  private async scanPlaylists() {
    const fetcher = new ItemFetcher<PlaylistWrapper>(
      this.eggsID,
      getEggshellverPlaylistsWrapped,
      getEggsPlaylistsWrapped,
      putPlaylists,
      postPlaylists
    );
    return this.handleFetcher(fetcher, "playlists");
  }

  private async scanTrackLikes() {
    const fetcher = new ItemFetcher<string>(
      this.eggsID,
      getEggshellverTrackLikesWrapped,
      getEggsTrackLikesWrapped,
      (targetIDs:string[]) => putLikes(targetIDs, "track"),
      (targetIDs:string[]) => postLikes(targetIDs, "track")
    );
    return this.handleFetcher(fetcher, "tracklikes");
  }

  private async scanPlaylistLikes() {
    const fetcher = new ItemFetcher<string>(
      this.eggsID,
      getEggshellverPlaylistLikesWrapped,
      getEggsPlaylistLikesWrapped,
      (targetIDs:string[]) => putLikes(targetIDs, "playlist"),
      (targetIDs:string[]) => postLikes(targetIDs, "playlist")
    );
    return this.handleFetcher(fetcher, "playlistlikes");
  }

  private async handleFetcher<E>(fetcher:ItemFetcher<E>, type:string) {
    try {
      await this.listenForCompletion(fetcher, type);
      fetcher.removeAllListeners();
      return true;
    } catch (err) {
      fetcher.removeAllListeners();
      console.error(err);
      return false;
    }
  }

  private async listenForCompletion<E>(fetcher:ItemFetcher<E>, part:string) {

    const complete = new Promise<void>((resolve, reject) => {
      fetcher.on("update", (progress) => {
        this.partProgress.value = progress.current;
        this.partProgress.max = progress.total;
        this.statusElement.innerText = this.processFetchLabel(progress.label, part, progress.percentage);
        this.fullProgress.value = progress.current + progress.total * this.completedParts;
        this.fullProgress.max = progress.total * this.totalParts;
      });
  
      fetcher.on("complete", () => {
        this.partProgress.value = 1;
        this.partProgress.max = 1;
        this.statusElement.innerText = this.t("sync.completedPart", {part: this.t(`sync.name.${part}`)});
        this.completedParts++;
        this.fullProgress.value = this.completedParts;
        this.fullProgress.max = this.totalParts;
        resolve();
      });

      fetcher.on("error", (error) => {
        this.displayError();
        reject(error);
      });
    });

    return complete;
  }

  private displayError() {
    this.statusElement.innerText = this.t("general.error");
    this.syncButton.classList.remove("syncing");
    this.syncButton.classList.add("errored");
  }

  private completeScan() {
    this.statusElement.innerText = this.t("sync.completedAll");
    this.syncButton.classList.remove("syncing");
  }

  private processFetchLabel(label:FetchLabel, part:string, progress:number) {
    switch (label) {
      case FetchLabel.FETCHING_PARTIAL:
        return this.t("sync.fetchingPartial", {part: this.t(`sync.name.${part}`), progress});
      case FetchLabel.FETCHING_FULL:
        return this.t("sync.fetchingFull", {part: this.t(`sync.name.${part}`), progress});
    }
  }
}
