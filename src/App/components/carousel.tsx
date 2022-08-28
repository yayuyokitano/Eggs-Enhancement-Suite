import React, { useEffect, useRef, useState } from "react";
import "../home/carouselItems.scss";
import { ArtistFetcherString, SongCurry } from "../../util/util";
import { ArrowBackIosNewRoundedIcon, ArrowForwardIosRoundedIcon } from "../../util/icons";
import { Incrementer, IncrementerError } from "./sync/itemFetcher";
import { TFunction } from "react-i18next";

interface CarouselSetParams<T> {
	width:number,
	size:string,
	type:string,
	t:TFunction,
	title:string,
	init:T[],
	ElementList:(props:{t:TFunction, items:T[], refName:React.RefObject<HTMLUListElement>, setScroll:React.Dispatch<React.SetStateAction<number>>}) => JSX.Element,
}

interface CarouselIncrementer<T> extends CarouselSetParams<T> {
	incrementer:Incrementer<T>,
	uniquePropName:keyof T,
}

interface CarouselFullParams<T> extends CarouselIncrementer<T> {
	eggsGetSongCurry:ArtistFetcherString
}

export default function Carousel<T>(props:CarouselSetParams<T>|CarouselIncrementer<T>|CarouselFullParams<T>) {
	const { ElementList, init, width, size, t, title } = props;
	const [scroll, setScroll] = useState(0);
	const [children, setChildren] = useState<T[]>(init);
	const carouselRef = useRef<HTMLUListElement>(null);

	useEffect(() => {
		if (carouselRef.current === null) return;
		carouselRef.current.classList.remove("ees-smooth-scroll");
		setTimeout(() => {
			if (carouselRef.current === null) return;
			carouselRef.current.classList.add("ees-smooth-scroll");
		}, 0);
	}, [children]);

	useEffect(() => {
		if (carouselRef.current === null) return;

		// add dynamic elements
		if ("incrementer" in props && props.incrementer.isAlive && !props.incrementer.fetching && carouselRef.current.scrollWidth - carouselRef.current.clientWidth - scroll < 2000) {
			props.incrementer.getPage(false).then(page => {
				setChildren((children) => [
					...children,
					...page.data.filter(item => !children.some(child => child[props.uniquePropName] === item[props.uniquePropName]))
				]);
			}).catch(err => {
				console.error(err);
				if (err instanceof Error && err.message === IncrementerError.NoItemsError) {
					props.incrementer?.kill();
				}
			});
		}

	} , [scroll]);

	return (
		<div className="ees-carousel-outer">
			<div className="ees-carousel-header">
				<h2>{t(title)}</h2>
				{("eggsGetSongCurry" in props) ? <CarouselPlayer
					t={t}
					eggsGetSongCurry={props.eggsGetSongCurry} /> : <></>}
			</div>
			<div className={`ees-carousel-wrapper ees-carousel-wrapper-${size}${("eggsGetSongCurry" in props) ? " ees-carousel-with-player" : ""}`}>
				<button
					className="ees-carousel-btn ees-carousel-prev"
					onClick={() => carouselPrev(width, carouselRef)}><ArrowBackIosNewRoundedIcon /></button>
				<div className="ees-carousel-inner">
					<ElementList
						t={t}
						items={children}
						refName={carouselRef}
						setScroll={setScroll} />
				</div>
				<button
					className="ees-carousel-btn ees-carousel-next"
					onClick={() => carouselNext(width, carouselRef)}><ArrowForwardIosRoundedIcon /></button>
			</div>
		</div>
	);
}

function CarouselPlayer(props: {t:TFunction, eggsGetSongCurry:ArtistFetcherString}) {
	const { eggsGetSongCurry, t } = props;
	return <div className="ees-carousel-play-wrapper">
		<span className="ees-carousel-play-label">{t("global:carousel.forEachArtist")}</span>
		<div className="ees-carousel-play-buttons">
			<button
				type="button"
				onClick={async () => playDynamic({
					artistFetcher: eggsGetSongCurry,
					songFetcher: "artistAllTracks"
				})}>{t("global:carousel.playAllTracks")}</button>
			<button
				type="button"
				onClick={async () => playDynamic({
					artistFetcher: eggsGetSongCurry,
					songFetcher: "artistTopTrack"
				})}>{t("global:carousel.playTopTrack")}</button>
			<button
				type="button"
				onClick={async () => playDynamic({
					artistFetcher: eggsGetSongCurry,
					songFetcher: "artistNewTrack"
				})}>{t("global:carousel.playNewestTrack")}</button>
		</div>
	</div>;
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

function carouselNext(width:number, carouselRef:React.RefObject<HTMLUListElement>) {
	if (carouselRef.current === null) return;
	carouselRef.current.scrollLeft += width;
}

function carouselPrev(width:number, carouselRef:React.RefObject<HTMLUListElement>) {
	if (carouselRef.current === null) return;
	carouselRef.current.scrollLeft -= width - (carouselRef.current.scrollLeft % width);
}
