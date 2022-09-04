import React, { useRef } from "react";
import { TFunction } from "react-i18next";
import { CloseRoundedIcon } from "../../../util/icons";
import "./modal.scss";

export interface ModalSetParams<T> {
	type:string,
	t:TFunction,
	title:string,
	childArray:T[],
	totalCount:number,
	setRemainingModalScroll:React.Dispatch<React.SetStateAction<number>>,
	ElementList: (props:{t:TFunction, items:T[], refName:React.RefObject<HTMLUListElement>}) => JSX.Element,
	modalRef:React.RefObject<HTMLDialogElement>,
}

export type ModalParamTemplate<T> = React.Dispatch<React.SetStateAction<ModalSetParams<T>>>;

export default function Modal<T>(props:ModalSetParams<T>) {
	const { ElementList, childArray, t, title, totalCount, setRemainingModalScroll, modalRef } = props;
	const modalListRef = useRef<HTMLUListElement>(null);

	return (
		<dialog
			className="ees-modal"
			ref={modalRef}>
			<div className="ees-modal-content">
				<div className="ees-modal-header">
					<h2>{t(title, {count: totalCount})}</h2>
					<button
						className="ees-modal-close"
						onClick={() => {
							if (modalRef.current === null) return;
							modalRef.current.close();
						}}><CloseRoundedIcon /></button>
				</div>
				<div
					className="ees-modal-body" 
					onScroll={e => setRemainingModalScroll(e.currentTarget.scrollHeight - e.currentTarget.clientHeight - e.currentTarget.scrollTop)}>
					<ElementList
						t={t}
						items={childArray}
						refName={modalListRef} />
				</div>
			</div>
		</dialog>
	);
}