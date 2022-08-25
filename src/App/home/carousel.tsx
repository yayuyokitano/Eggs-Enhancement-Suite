import { useEffect, useRef, useState } from "react";
import "./carouselItems.scss";
import { clamp } from "../../util/util";
import { ArrowBackIosNewRoundedIcon, ArrowForwardIosRoundedIcon } from "../../util/icons";

export default function Carousel(props: { children:JSX.Element[], width:number, size:string }) {
	const { children, width, size } = props;
	const [scroll, setScroll] = useState(0);
	const carouselRef = useRef<HTMLUListElement>(null);

	useEffect(() => {
		if (carouselRef.current === null) return;
		setScroll(clamp(0, scroll, carouselRef.current.scrollWidth - carouselRef.current.clientWidth));
		carouselRef.current.scrollLeft = scroll;
	} , [scroll]);

	return (
		<div className={`ees-carousel-wrapper ees-carousel-wrapper-${size}`}>
			<button
				className="ees-carousel-btn ees-carousel-prev"
				onClick={() => carouselPrev(width, scroll, setScroll)}><ArrowBackIosNewRoundedIcon /></button>
			<ul
				className="ees-carousel"
				ref={carouselRef}>
				{children.map((Item) => <CarouselItem key={Item.key}>{Item}</CarouselItem>)}
			</ul>
			<button
				className="ees-carousel-btn ees-carousel-next"
				onClick={() => carouselNext(width, scroll, setScroll)}><ArrowForwardIosRoundedIcon /></button>
		</div>
	);
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