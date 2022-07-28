import { eggsRequest } from "./request"

export interface Profile {
  data: {
    birthDate: string,
    displayName: string,
    displayNameKatakana: string,
    gender: string,
    genreId1: number|null,
    genreId2: number|null,
    genreOther: number|null,
    imageDataPath: string|null,
    isDeliveryNews: number,
    isPublished: number,
    mail: string,
    prefectureCode: number|null,
    profile: string|null,
    reliability: number,
    totalToken: number,
    userId: number,
    userName: string
  }
}

export async function profile() {
  return eggsRequest("users/users/profile", {}, {
    isAuthorizedRequest: true,
  }) as Promise<Profile>;
}