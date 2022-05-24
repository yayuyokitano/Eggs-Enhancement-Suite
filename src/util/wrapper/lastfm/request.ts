import * as Logger from "./interfaces/loggerInterface";
import LastFM from ".";
import { boolToInt } from "./caster";
import md5 from "md5";

export interface LFMArgumentObject {
	
	method:string;

	lang?:string;
	tag?:string;
	user?:string;
	sk?:string;
	country?:string;
	location?:string;
	num_res?:number;
	offset?:number;
	page?:number;
	limit?:number;
	token?:string;
	api_sig?:string;
	username?:string;
	password?:string;
	artist?:string;
	album?:string;
	tags?:string;
	mbid?:string;
	track?:string;
	timestamp?:number;
	taggingType?:string;
	autocorrect?:boolean|number;
	recenttracks?:boolean|number;
	usernameOrSessionKey?:string;

}


export class LFMRequest {

	private key:string;
	private params:LFMArgumentObject;
	private secret:string;
	private response:any;
	private userAgent:string;
	private connectionType:string;
	private context:LastFM;
	private startTime:number;

	public constructor(info:Logger.infoInterface, userAgent:string, secureConnection:boolean, params:LFMArgumentObject) {

		this.key = info.key;
		this.params = Object.fromEntries(Object.entries(params).filter((e) => e[1] !== void 0 && e[1] !== null)) as LFMArgumentObject;
		this.secret = info.secret;
		this.userAgent = userAgent;
		this.connectionType = secureConnection ? "https" : "http";
		this.context = info.context;
		this.startTime = Date.now();

		if (this.params.hasOwnProperty("autocorrect")) {
			this.params.autocorrect = boolToInt(this.params.autocorrect as boolean ?? true);
		}

		if (this.params.hasOwnProperty("recenttracks")) {
			this.params.recenttracks = boolToInt(this.params.recenttracks as boolean ?? true);
		}

		if (this.params.hasOwnProperty("usernameOrSessionKey")) {
			this.params.user = this.params.usernameOrSessionKey;
			delete this.params.usernameOrSessionKey;
		}

	}

	public async execute() {

		const isPostRequest = this.isPostRequest();

		if (isPostRequest) {

			if (this.secret === "") {
				throw new SyntaxError("Please enter an api secret key to use post requests with session key.");
			}

			this.startTime = Date.now();
			this.response = await this.post();

		} else {

			this.startTime = Date.now();
			this.response = await this.get();
			
		}

		return {
			res: await this.checkStatus(),
			time: Date.now() - this.startTime
		};

	}

	async checkStatus() {

		//request errors
		if (!this.response.ok) {

			const response = await this.response.json();

			if (typeof response === "object" && response !== null && response.hasOwnProperty("error") && response.hasOwnProperty("message")) {
				throw {
					code: response.error,
					message: response.message
				};
			} else {
				throw {
					message: this.response.statusText,
					response
				};
			}

		}

		try {
			this.response = await this.response.json();
		} catch (err) {
			throw new Error("Returned invalid json! Most likely a Last.FM issue.");
		}

		//lastfm errors
		if (this.response.hasOwnProperty("error")) {

			let error = {
				message: this.response.message,
				code: this.response.error
			};

			throw error;

		}

		//successful request
		return this.response;

	}

	private async post() {

		if (this.params.hasOwnProperty("user")) {
			this.params.sk = this.params.user;
			delete this.params.user;
		}

		if (this.params.hasOwnProperty("username")) {
			this.params.sk = this.params.username;
			delete this.params.username;
		}

		const api_sig = this.getSignature();

		const requestParam = {
			...this.params,
			api_key: this.key,
			format: "json",
			api_sig
		};

		const paramString = stringify(requestParam);

		return await fetch(`${this.connectionType}://ws.audioscrobbler.com/2.0/`, {
			method: "POST",
			headers: {
				"Content-Length":  new Blob([paramString.toString()]).size.toString(),
				"Content-Type": "application/x-www-form-urlencoded",
				"User-Agent": this.userAgent
			},
			body: paramString
		});

	}

	private async get() {

		const params = {
			api_key: this.key,
			format: "json",
			...this.params
		};
		
		return await fetch(`${this.connectionType}://ws.audioscrobbler.com/2.0?${stringify(params)}`, {
			method: "GET",
			headers: {
				"User-Agent": this.userAgent
			}
		});

	}

	private getSignature() {

		const paramObj:any = {
			...this.params,
			api_key: this.key
		};

		const args = Object.keys(paramObj).sort().map((e) => [e, paramObj[e]]) as string[][];

		let sig = args.reduce((acc, cur) => `${acc}${cur[0]}${cur[1]}`, "");

		sig = md5(sig + this.secret);

		return sig;

	}

	private isPostRequest() {
		return this.params.user?.length === 32 || this.params.username?.length === 32 || this.params.hasOwnProperty("sk") || this.params.hasOwnProperty("token") || this.params.hasOwnProperty("password");
	}

}

function stringify(params:{[key:string]:string|number|boolean}) {
  const paramObj = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    let strVal = "";
    switch (typeof value) {
      case "string":
        strVal = value;
        break;
      case "boolean":
        strVal = value ? "true" : "false";
        break;
      case "number":
        strVal = value.toString();
        break;
    }
    paramObj.append(key, strVal);
  }
  return paramObj.toString();
}
