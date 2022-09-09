import { useEffect, useRef, useState } from "react";
import { TFunction } from "react-i18next";
import { curryEggshellverFollowees, curryEggshellverFollowers } from "../../../util/wrapper/eggshellver/follow";
import { Icon, PeopleOutlineRoundedIcon, PeopleRoundedIcon } from "../../../util/icons";
import Modal from "../listModal/listModal";
import { UserStubModalList } from "../listModal/modalGenerators";
import { Incrementer, IncrementerError } from "../sync/itemFetcher";

export default function UserStats(props: {t:TFunction, eggsID:string}) {
	const { t, eggsID } = props;
	return (
		<div id="ees-user-stats">
			<EggshellverModalButton
				t={t}
				id="ees-user-stats-followees"
				title="userstats.following"
				type="userstub"
				incrementer={new Incrementer(curryEggshellverFollowees(eggsID), 30)}
				ModalElementList={UserStubModalList}
				uniquePropName="userName"
				Icon={PeopleRoundedIcon}
			/>
			<EggshellverModalButton
				t={t}
				id="ees-user-stats-followers"
				title="userstats.followers"
				type="userstub"
				incrementer={new Incrementer(curryEggshellverFollowers(eggsID), 30)}
				ModalElementList={UserStubModalList}
				uniquePropName="userName"
				Icon={PeopleOutlineRoundedIcon}
			/>

			{/*<EggshellverModalButton
				t={t}
				id="ees-user-stats-liked-tracks"
				title="userstats.likedtracks"
				type="liked-tracks"
				Icon={FavoriteRoundedIcon}
				ModalElementList={TrackModalList}
	uniquePropName="musicId" />*/}
		</div>
	);
}

type EggshellverModalArgs<T> = {
	t:TFunction;
	id:string;
	title:string;
	type:string;
	incrementer:Incrementer<T>;
	Icon:Icon
	ModalElementList:(props:{t:TFunction, items:T[], refName:React.RefObject<HTMLUListElement>}) => JSX.Element;
	uniquePropName:keyof T;
}

function EggshellverModalButton<T>(props:EggshellverModalArgs<T>) {
	const { t, id, title, type, incrementer, ModalElementList, uniquePropName, Icon } = props;

	const [remainingModalScroll, setRemainingModalScroll] = useState(0);
	const [children, setChildren] = useState<T[]>([]);
	const [totalCount, setTotalCount] = useState<number>(0);
	const [update, setUpdate] = useState(false);
	const [hasFetched, setHasFetched] = useState(false);
	const modalRef = useRef<HTMLDialogElement>(null);

	useEffect(() => {

		// add dynamic elements
		if (
			!hasFetched || (
				incrementer.isAlive
				&& !incrementer.fetching
				&& modalRef?.current?.open
				&& remainingModalScroll < 2000
			)
		) {
			setHasFetched(true);
			incrementer.getPage({
				shouldCompare: false,
				ignoreNoItemError: false
			}).then(page => {
				setTotalCount(page.totalCount);
				setChildren((children) => [
					...children,
					...page.data.filter(item => !children.some(child => child[uniquePropName] === item[uniquePropName]))
				]);
			}).catch(err => {
				if (err instanceof Error && err.message === IncrementerError.NoItemsError) {
					incrementer?.kill();
				}
				setUpdate(!update);
			});
		}

	} , [remainingModalScroll, update]);

	return (
		<div
			id={id}
			className="ees-user-stats-item">
			<button
				type="button"
				className="ees-user-stats-button"
				onClick={e => {
					if (!modalRef.current) return;
					e.stopPropagation();
					modalRef.current.showModal();
				}}>
				<Icon />
				{t(title, {count: totalCount})}
			</button>
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
