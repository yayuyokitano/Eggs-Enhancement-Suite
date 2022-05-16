import browser from "webextension-polyfill";

const generateRandomHex = (size:number) => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');

async function getDeviceID() {
  const deviceID = await browser.storage.local.get("deviceID");
  if (deviceID.deviceID) {
    return deviceID.deviceID;
  }
  const newDeviceID = generateRandomHex(16);
  await browser.storage.local.set({deviceID: newDeviceID});
  return newDeviceID;
}

export async function getToken() {
  return browser.storage.local.get();
}

export const eggsRoot = "https://api-flmg.eggs.mu/v1/";
export const eggsSelector = "https://api-flmg.eggs.mu/v1/*";
export const eggsUserAgent = "flamingo/7.0.02 (Android; 11)";
export const defaultAvatar = "https://eggs.mu/wp-content/themes/eggs/assets/img/common/signin.png";

export async function getEggsHeaders(isAuthorizedRequest:boolean = false):Promise<{
  "User-Agent": string;
  Apversion: string;
  "Content-Type": string;
  deviceId: any;
  deviceName: string;
  authorization: string;
} | {
  "User-Agent": string;
  Apversion: string;
  "Content-Type": string;
  deviceId: any;
  deviceName: string;
}> {
  if (isAuthorizedRequest) {
    return {
      "User-Agent": eggsUserAgent,
      Apversion: "7.0.02",
      "Content-Type": "application/json; charset=utf-8",
      deviceId: await getDeviceID(),
      deviceName: "SM-G977N",
      authorization: "Bearer " + (await getToken()).token,
    };
  }
  return {
    "User-Agent": eggsUserAgent,
    Apversion: "7.0.02",
    "Content-Type": "application/json; charset=utf-8",
    deviceId: await getDeviceID(),
    deviceName: "SM-G977N"
  };
};

export const processedPathname = () => "/" + window.location.pathname.split("/").filter((_,i)=>i%2).join("/")

// returns shuffled array, avoids mutating the original array to allow unshuffling.
export function shuffleArray(array:any[]) {
  let copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
