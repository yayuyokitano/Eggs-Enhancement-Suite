import { useEffect, useRef, useState } from "react";
import "./carouselItems.scss";
import { ArtistFetcherString, clamp, SongCurry } from "../../util/util";
import { ArrowBackIosNewRoundedIcon, ArrowForwardIosRoundedIcon } from "../../util/icons";
import { EggsGet, Incrementer, IncrementerError } from "../../App/components/sync/itemFetcher";

interface CarouselSetParams {
	children?:JSX.Element[],
	width:number,
	size:string,
	type:string
}

interface CarouselFullParams<T> extends CarouselSetParams {
	eggsGet:EggsGet<T>,
	elementGenerator:(e:T) => JSX.Element,
	eggsGetSongCurry:ArtistFetcherString
}

export default function Carousel<T>(props:CarouselSetParams|CarouselFullParams<T>) {
	const { children, width, size } = props;
	const [scroll, setScroll] = useState(0);
	const [childState, setChildren] = useState<JSX.Element[]>([]);

	// this is scuffed but it works. It's needed because the first time the element is rendered, there are no children.
	if (children && childState.length === 0 && children.length > 0) setChildren(children);

	const carouselRef = useRef<HTMLUListElement>(null);
	const incrementer = ("eggsGet" in props && new Incrementer(props.eggsGet, 50)) || undefined;

	useEffect(() => {
		if (carouselRef.current === null) return;
		setScroll(clamp(0, scroll, carouselRef.current.scrollWidth - carouselRef.current.clientWidth));
		carouselRef.current.scrollLeft = scroll;

		// add dynamic elements
		if ("elementGenerator" in props && incrementer && incrementer.isAlive && carouselRef.current.scrollWidth - carouselRef.current.clientWidth - scroll < 2000) {
			incrementer.getPage().then(page => {
				setChildren((children) => [
					...children,
					...page.data.map(props.elementGenerator)
				]);
			}).catch(err => {
				if (err instanceof Error && err.message === IncrementerError.NoItemsError) {
					incrementer.kill();
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
				<ul
					className="ees-carousel"
					ref={carouselRef}>
					{childState.map((Item) => <CarouselItem key={Item.key}>{Item}</CarouselItem>)}
				</ul>
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

function CarouselItem(props: { children:JSX.Element }) {
	const { children } = props;

	return (
		<li className="ees-carousel-item">
			{children}
		</li>
	);
}