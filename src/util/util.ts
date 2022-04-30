const generateRandomHex = (size:number) => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');

export const eggsRoot = "https://api-flmg.eggs.mu/v1/";
export const eggsSelector = "https://api-flmg.eggs.mu/v1/*";
export const eggsHeaders = {
  "User-Agent": "flamingo/7.0.02 (Android; 11)",
  Apversion: "7.0.02",
  deviceId: generateRandomHex(16),
  deviceName: "SM-G977N"
}