import { endpoints } from "../../../util/endpoints";
import { getDeviceID, getToken, processedPathname } from "../../../util/util";

export const eggsRoot = "https://api-flmg.eggs.mu/v1/";
const eggsUserAgent = "flamingo/7.1.00 (Android; 11)";

export default class Cacher {

	private cachedRequests: { [key: string]: Promise<any> } = {};
	private id = Math.random();
	private deviceId: Promise<string>;
	private token: Promise<string|undefined>;
	private startTime = Date.now();

	public constructor() {
		this.deviceId = Promise.resolve(getDeviceID());
		this.token = Promise.resolve(getToken());

		if (window.frameElement === null || window.frameElement.classList.contains("aut-iframe")) return;
		
		const endpoint = endpoints[processedPathname()];
		if (!endpoint) return;
		endpoint.cacheFunc(this);
	}

	public async fetch<T>(input: URL | RequestInfo, init?: RequestInit): Promise<T> {
		if (init?.method === "GET" && !Object.prototype.hasOwnProperty.call(this.cachedRequests, input.toString())) {

			console.log(this.id, Date.now() - this.startTime, "cache: adding " + input.toString());

			this.cachedRequests[input.toString()] = fetch(input, init).then(async(res) => {
				if (!res.ok) {
					throw new Error(`${res.status} ${res.statusText}`);
				}
				const resJSON = await res.json();
				if ("code" in resJSON && "message" in resJSON) {
					throw new Error(`${resJSON.code} ${resJSON.message}`);
				}
				return resJSON;
			});

		} else {
			console.log(this.id, Date.now() - this.startTime, "cache: requesting " + input.toString());
		}
		
		return this.cachedRequests[input.toString()];
	}

	public async getEggsHeaders(isAuthorizedRequest = false):Promise<EggsHeaders> {
		const token = await this.token;
		if (isAuthorizedRequest) {
			if (!token) {
				throw new Error("not logged in.");
			}
			return {
				"User-Agent": eggsUserAgent,
				Apversion: "7.1.00",
				"Content-Type": "application/json; charset=utf-8",
				deviceId: await this.deviceId,
				deviceName: "SM-G977N",
				authorization: "Bearer " + token,
			};
		}
		return {
			"User-Agent": eggsUserAgent,
			Apversion: "7.1.00",
			"Content-Type": "application/json; charset=utf-8",
			deviceId: await this.deviceId,
			deviceName: "SM-G977N"
		};
	}
}

type EggsHeaders = {
	"User-Agent": string;
	Apversion: string;
	"Content-Type": string;
	deviceId: string;
	deviceName: string;
	authorization?:string;
}