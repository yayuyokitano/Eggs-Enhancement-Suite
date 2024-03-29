import React, { useEffect, useRef, useState } from "react";
import "./carouselItems.scss";
import { ArtistFetcherString, SongCurry } from "../../../util/util";
import { ArrowBackIosNewRoundedIcon, ArrowForwardIosRoundedIcon } from "../../../util/icons";
import { Incrementer, IncrementerError } from "../sync/itemFetcher";
import { TFunction } from "react-i18next";
import Modal from "../listModal/listModal";
import { Path } from "../../search/searchGenre";

interface CarouselSetParams<T> {
	width:number,
	size:"small"|"medium"|"large"|"extralarge",
	type:string,
	t:TFunction,
	title:string,
	init:T[],
	ElementList:(props:{t:TFunction, items:T[], refName:React.RefObject<HTMLUListElement>, setScroll:React.Dispatch<React.SetStateAction<number>>}) => JSX.Element,
	ModalElementList:(props:{t:TFunction, items:T[], refName:React.RefObject<HTMLUListElement>}) => JSX.Element,
}

interface CarouselIncrementer<T> extends CarouselSetParams<T> {
	incrementer:Incrementer<T>,
	uniquePropName:keyof T,
	ignoreNoItemError?:boolean,
}

interface CarouselFullParams<T> extends CarouselIncrementer<T> {
	eggsGetSongCurry:ArtistFetcherString,
	payload?:string,
}

interface CarouselDynamicParams<T> extends CarouselFullParams<T> {
	path: Path
}

export default function Carousel<T>(props:CarouselSetParams<T>|CarouselIncrementer<T>|CarouselFullParams<T>|CarouselDynamicParams<T>) {
	const { ElementList, init, width, size, type, t, title, ModalElementList } = props;
	const [scroll, setScroll] = useState(0);
	const [remainingModalScroll, setRemainingModalScroll] = useState(0);
	const [children, setChildren] = useState<T[]>(init);
	const [totalCount, setTotalCount] = useState(0);
	const [update, setUpdate] = useState(false);
	const modalRef = useRef<HTMLDialogElement>(null);
	const carouselRef = useRef<HTMLUListElement>(null);

	if ("path" in props) {
		useEffect(() => {
			setChildren(props.init);
			setTotalCount(0);
			setScroll(0);
			setRemainingModalScroll(0);
			setUpdate(u => !u);
		}, [props.path]);
	}
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
		if (
			"incrementer" in props
			&& props.incrementer.isAlive
			&& !props.incrementer.fetching
			&& (
				carouselRef.current.scrollWidth - carouselRef.current.clientWidth - scroll < 2000
				|| (
					modalRef?.current?.open
					&& remainingModalScroll < 2000
				)
			)
		) {
			props.incrementer.getPage({
				shouldCompare: false,
				ignoreNoItemError: props?.ignoreNoItemError ?? false
			}).then(page => {
				setTotalCount(page.totalCount);
				setChildren((children) => [
					...children,
					...page.data.filter(item => !children.some(child => child[props.uniquePropName] === item[props.uniquePropName]))
				]);
			}).catch(err => {
				if (err instanceof Error && err.message === IncrementerError.NoItemsError) {
					props.incrementer?.kill();
				}
				setUpdate(!update);
			});
		}

	} , [scroll, remainingModalScroll, update]);

	return (
		<div className="ees-carousel-outer">
			<div className="ees-carousel-header">
				<h2>{t(title, {count: totalCount})}</h2>
				{("eggsGetSongCurry" in props) ? <CarouselPlayer
					t={t}
					eggsGetSongCurry={props.eggsGetSongCurry}
					payload={props.payload} /> : <></>}
			</div>
			<div className={`ees-carousel-wrapper ees-carousel-wrapper-${size}${("eggsGetSongCurry" in props) ? " ees-carousel-with-player" : ""}`}>
				<button
					type="button"
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
					type="button"
					className="ees-carousel-btn ees-carousel-next"
					onClick={() => carouselNext(width, carouselRef)}><ArrowForwardIosRoundedIcon /></button>
			</div>
			<div className="ees-carousel-footer">
				<button
					type="button"
					className="ees-carousel-modal-btn"
					onClick={e => {
						e.currentTarget.blur();
						if (!modalRef.current) return;
						e.stopPropagation();
						modalRef.current.showModal();
					}
					}>
					{t("global:general.more")}
				</button>
			</div>
			<Modal
				modalRef={modalRef}
				title={title}
				type={type}
				t={t}
				setRemainingModalScroll={setRemainingModalScroll}
				totalCount={totalCount}
				childArray={children}
				ElementList={ModalElementList} />
		</div>
	);
}

function CarouselPlayer(props: {t:TFunction, eggsGetSongCurry:ArtistFetcherString, payload?:string}) {
	const { eggsGetSongCurry, t, payload } = props;
	return <div className="ees-carousel-play-wrapper">
		<span className="ees-carousel-play-label">{t("global:carousel.forEachArtist")}</span>
		<div className="ees-carousel-play-buttons">
			<button
				type="button"
				className="ees-carousel-play-all"
				onClick={async () => playDynamic({
					artistFetcher: eggsGetSongCurry,
					songFetcher: "artistAllTracks",
					payload,
				})}>{t("global:carousel.playAllTracks")}</button>
			<button
				type="button"
				className="ees-carousel-play-top"
				onClick={async () => playDynamic({
					artistFetcher: eggsGetSongCurry,
					songFetcher: "artistTopTrack",
					payload,
				})}>{t("global:carousel.playTopTrack")}</button>
			<button
				type="button"
				className="ees-carousel-play-new"
				onClick={async () => playDynamic({
					artistFetcher: eggsGetSongCurry,
					songFetcher: "artistNewTrack",
					payload,
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
