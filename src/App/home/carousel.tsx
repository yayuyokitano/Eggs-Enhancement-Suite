import { useEffect, useRef, useState } from "react";
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import "./carousel.scss";
import { clamp } from "../../util/util";

export default function Carousel(props: { children:JSX.Element[], width:number }) {
  const { children, width } = props;
  const [scroll, setScroll] = useState(0);
  const carouselRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (carouselRef.current === null) return;
    console.log("running useEffect");
    setScroll(clamp(0, scroll, carouselRef.current.scrollWidth - carouselRef.current.clientWidth));
    carouselRef.current.scrollLeft = scroll;
  } , [scroll]);

  return (
    <div className="ees-carousel-wrapper">
      <button className="ees-carousel-prev" onClick={() => carouselPrev(width, scroll, setScroll)}><ArrowBackIosNewRoundedIcon /></button>
      <ul className="ees-carousel" ref={carouselRef}>
        {children.map((Item, i) => <CarouselItem key={i}>{Item}</CarouselItem>)}
      </ul>
      <button className="ees-carousel-next" onClick={() => carouselNext(width, scroll, setScroll)}><ArrowForwardIosRoundedIcon /></button>
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