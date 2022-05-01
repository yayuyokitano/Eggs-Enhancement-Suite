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

export const eggsRoot = "https://api-flmg.eggs.mu/v1/";
export const eggsSelector = "https://api-flmg.eggs.mu/v1/*";
export const eggsUserAgent = "flamingo/7.0.02 (Android; 11)";

export async function getEggsHeaders() {
  return {
    "User-Agent": eggsUserAgent,
    Apversion: "7.0.02",
    deviceId: await getDeviceID(),
    deviceName: "SM-G977N"
  };
};