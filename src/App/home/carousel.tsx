import { useEffect, useRef, useState } from "react";
import "./carouselItems.scss";
import { ArtistFetcherString, clamp, SongCurry } from "../../util/util";
import { ArrowBackIosNewRoundedIcon, ArrowForwardIosRoundedIcon } from "../../util/icons";
import { Incrementer, IncrementerError } from "../../App/components/sync/itemFetcher";
import { TFunction } from "react-i18next";

interface CarouselSetParams<T> {
	width:number,
	size:string,
	type:string,
	t:TFunction,
	init:T[],
	ElementList:(props:{t:TFunction, items:T[], refName:React.RefObject<HTMLUListElement>}) => JSX.Element
}

interface CarouselFullParams<T> extends CarouselSetParams<T> {
	incrementer:Incrementer<T>,
	eggsGetSongCurry:ArtistFetcherString
}

export default function Carousel<T>(props:CarouselSetParams<T>|CarouselFullParams<T>) {
	const { ElementList, init, width, size, t } = props;
	const [scroll, setScroll] = useState(0);
	const [children, setChildren] = useState<T[]>(init);
	const carouselRef = useRef<HTMLUListElement>(null);

	useEffect(() => {
		if (carouselRef.current === null) return;
		setScroll(clamp(0, scroll, carouselRef.current.scrollWidth - carouselRef.current.clientWidth));
		carouselRef.current.scrollLeft = scroll;

		// add dynamic elements
		if ("incrementer" in props && props.incrementer.isAlive && carouselRef.current.scrollWidth - carouselRef.current.clientWidth - scroll < 2000) {
			console.log("getting new");
			props.incrementer.getPage().then(page => {
				setChildren((children) => [
					...children,
					...page.data
				]);
			}).catch(err => {
				if (err instanceof Error && err.message === IncrementerError.NoItemsError) {
					props.incrementer.kill();
				}
			});
		}

	} , [scroll]);

	return (
		<div className="ees-carousel-outer">
			{("eggsGetSongCurry" in props) ? <CarouselPlayer eggsGetSongCurry={props.eggsGetSongCurry} /> : <></>}
			<div className={`ees-carousel-wrapper ees-carousel-wrapper-${size}`}>
				<button
					className="ees-carousel-btn ees-carousel-prev"
					onClick={() => carouselPrev(width, scroll, setScroll)}><ArrowBackIosNewRoundedIcon /></button>
				<ElementList
					t={t}
					items={children}
					refName={carouselRef} />
				<button
					className="ees-carousel-btn ees-carousel-next"
					onClick={() => carouselNext(width, scroll, setScroll)}><ArrowForwardIosRoundedIcon /></button>
			</div>
		</div>
	);
}

function CarouselPlayer(props: {eggsGetSongCurry:ArtistFetcherString}) {
	const { eggsGetSongCurry } = props;
	return <button
		type="button"
		onClick={async () => playDynamic({
			artistFetcher: eggsGetSongCurry,
			songFetcher: "artistAllTracks"
		})}>hi</button>;
}

function playDynamic(eggsGetSongCurry:SongCurry) {
	window.parent.postMessage({
		type: "trackUpdate",
		data: {
			type: "setPlaybackDynamic",
			eggsGetSongCurry
		}
	}, "*");
}

function carouselNext(width:number, scroll:number, setScroll:React.Dispatch<React.SetStateAction<number>>) {
	setScroll(scroll + width);
}

function carouselPrev(width:number, scroll:number, setScroll:React.Dispatch<React.SetStateAction<number>>) {
	setScroll(scroll - ((scroll % width) || width));
}
