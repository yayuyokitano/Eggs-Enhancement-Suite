import TagClass from "./classes/tag";
import ChartClass from "./classes/chart";
import AuthClass from "./classes/auth";
import AlbumClass from "./classes/album";
import ArtistClass from "./classes/artist";
import LibraryClass from "./classes/library";
import TrackClass from "./classes/track";
import UserClass from "./classes/user";
import HelperClass from "./classes/helper";
import GeoClass from "./classes/geo";

export default class LastFM {
	public tag:TagClass;
	public chart:ChartClass;
	public geo:GeoClass;
	public auth:AuthClass;
	public album:AlbumClass;
	public artist:ArtistClass;
	public library:LibraryClass;
	public track:TrackClass;
	public user:UserClass;
	public helper:HelperClass;

	public info:{
		key:string,
		secret:string,
		context:LastFM
	};

	public constructor(apiKey:string, options?:{apiSecret?:string, userAgent?:string, secureConnection?:boolean}) {
		if (!options) {
			options = {};
		}

		options.apiSecret ??= "";
		options.userAgent ??= "lastfm-typed-npm";
		options.secureConnection ??= true;

		let {apiSecret, userAgent, secureConnection} = options;

		this.info = {
			key: apiKey,
			secret: apiSecret,
			context: this
		};

		this.tag = new TagClass(apiKey, this, apiSecret, userAgent, secureConnection);
		this.chart = new ChartClass(apiKey, this, apiSecret, userAgent, secureConnection);
		this.geo = new GeoClass(apiKey, this, apiSecret, userAgent, secureConnection);
		this.auth = new AuthClass(apiKey, this, apiSecret, userAgent, secureConnection);
		this.album = new AlbumClass(apiKey, this, apiSecret, userAgent, secureConnection);
		this.artist = new ArtistClass(apiKey, this, apiSecret, userAgent, secureConnection);
		this.library = new LibraryClass(apiKey, this, apiSecret, userAgent, secureConnection);
		this.track = new TrackClass(apiKey, this, apiSecret, userAgent, secureConnection);
		this.user = new UserClass(apiKey, this, apiSecret, userAgent, secureConnection);
		this.helper = new HelperClass(this);
	}
}
