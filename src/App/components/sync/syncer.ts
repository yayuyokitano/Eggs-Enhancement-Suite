import { TFunction } from "react-i18next";
import { getEggsPlaylistsWrapped } from "../../../util/wrapper/eggs/playlists";
import { getEggshellverPlaylistsWrapped, PlaylistWrapper, postPlaylists, putPlaylists } from "../../../util/wrapper/eggshellver/playlist";
import { getEggsPlaylistLikesWrapped, getEggsTrackLikesWrapped } from "../../../util/wrapper/eggs/evaluation";
import { getEggsFollowsWrapped, profile } from "../../../util/wrapper/eggs/users";
import { getEggshellverPlaylistLikesWrapped, getEggshellverTrackLikesWrapped, postLikes, putLikes } from "../../../util/wrapper/eggshellver/like";
import ItemFetcher, { FetchLabel } from "./itemFetcher";
import { getEggshellverFollowsWrapped, postFollows, putFollows } from "../../../util/wrapper/eggshellver/follow";
import { UserStub } from "../../../util/wrapper/eggshellver/util";
import React from "react";
import { StateAction } from "./sync";

export default class Syncer {

  private eggsID:string;
  private completedParts = 0;
  private totalParts = 4;
  private ready:Promise<Boolean>
  private dispatch:React.Dispatch<StateAction>;
  private shouldFullScan:boolean;
  
  constructor(dispatch:React.Dispatch<StateAction>, shouldFullScan:boolean) {
    this.eggsID = "";
    this.dispatch = dispatch;
    this.shouldFullScan = shouldFullScan;
    this.ready = new Promise(async(resolve) => {
      const user = await profile();
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
      this.shouldFullScan,
    );
    return this.handleFetcher(fetcher, "follows");
  }

  private async scanPlaylists() {
    const fetcher = new ItemFetcher<PlaylistWrapper>(
      this.eggsID,
      getEggshellverPlaylistsWrapped,
      getEggsPlaylistsWrapped,
      putPlaylists,
      postPlaylists,
      this.shouldFullScan,
    );
    return this.handleFetcher(fetcher, "playlists");
  }

  private async scanTrackLikes() {
    const fetcher = new ItemFetcher<string>(
      this.eggsID,
      getEggshellverTrackLikesWrapped,
      getEggsTrackLikesWrapped,
      (targetIDs:string[]) => putLikes(targetIDs, "track"),
      (targetIDs:string[]) => postLikes(targetIDs, "track"),
      this.shouldFullScan,
    );
    return this.handleFetcher(fetcher, "tracklikes");
  }

  private async scanPlaylistLikes() {
    const fetcher = new ItemFetcher<string>(
      this.eggsID,
      getEggshellverPlaylistLikesWrapped,
      getEggsPlaylistLikesWrapped,
      (targetIDs:string[]) => putLikes(targetIDs, "playlist"),
      (targetIDs:string[]) => postLikes(targetIDs, "playlist"),
      this.shouldFullScan,
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
        this.dispatch({
          type: "updateStatus",
          payload: {
            status: this.processFetchLabel(progress.label, part, progress.percentage),
            progressPart: {
              value: progress.current,
              max: progress.total,
            },
            progressFull: {
              value: progress.current + progress.total * this.completedParts,
              max: progress.total * this.totalParts,
            },
          },
        });
      });
  
      fetcher.on("complete", () => {
        this.completedParts++;
        this.dispatch({
          type: "updateStatus",
          payload: {
            status: {
              key: "sync.completedPart",
              options: {
                part: `sync.name.${part}`,
              }
            },
            progressPart: {
              value: 1,
              max: 1,
            },
            progressFull: {
              value: this.completedParts,
              max: this.totalParts,
            },
          },
        });
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
    this.dispatch({
      type: "updateMessage",
      payload: {
        key: "general.error",
      }
    });
    this.dispatch({
      type: "setState",
      payload: "errored",
    });
  }

  private completeScan() {
    this.dispatch({
      type: "updateMessage",
      payload: {
        key: "sync.completedAll",
      }
    });
    this.dispatch({
      type: "setState",
      payload: "",
    });
  }

  private processFetchLabel(label:FetchLabel, part:string, progress:number) {
    switch (label) {
      case FetchLabel.FETCHING_PARTIAL:
        return {
          key: "sync.fetchingPartial",
          options: {
            part: `sync.name.${part}`,
            progress,
          }
        };
      case FetchLabel.FETCHING_FULL:
        return {
          key: "sync.fetchingFull",
          options: {
            part: `sync.name.${part}`,
            progress,
          }
        };
    }
  }
}
