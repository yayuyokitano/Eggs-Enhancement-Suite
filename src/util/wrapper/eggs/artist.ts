import { eggsRequest } from "./request"

enum SourceType {
  Eggs = 1,
  Youtube,
}

interface ArtistData {
  activityArea: string|null,
  artistId: number,
  artistName: string,
  displayName: string,
  displayNameHiragana: string,
  displayNameKatakana: string,
  genreId1: number|null,
  genreId2: number|null,
  genreOther: number|null,
  imageDataPath: string|null,
  isDeliveryNews: number,
  label: string|null,
  mail: string,
  officialSiteUrl: string|null,
  prefectureCode: number|null,
  production: string|null,
  profile: string|null,
  reliability: number,
  twitterScreenName: string|null,
}

export interface SongData {
  artistData: ArtistData,
  cmoComposer: string|null,
  cmoLyricist: string|null,
  cmoProductCode: string|null,
  composer: string|null,
  copyrightManagement: number
  explanation: string|null,
  genreId: number|null,
  imageDataPath: string|null,
  inspectionStatus: string,
  isFollowerOnly: number,
  isInstrumental: number,
  isPublished: number,
  lyricist: string,
  lyrics: string,
  musicDataPath: string,
  musicId: string,
  musicTitle: string,
  musicTitleHiragana: string|null,
  musicTitleKatakana: string|null,
  numberOfComments: number,
  numberOfLikes: number,
  numberOfMusicPlays: number,
  originalMusicFileName: string,
  releaseDate: string,
  releaseEndDate: string|null,
  sortNumber: number,
  sourceType: SourceType,
  tags: string[],
  youtubeUrl: string|null,
  youtubeVideoId: string|null,
}

export interface ArtistEndpoint {
  totalCount: number,
  data: SongData[]
}

export async function artist(artistID:string) {
  return eggsRequest(`artists/artists/${artistID}/musics`, {}) as Promise<ArtistEndpoint>;
  
}