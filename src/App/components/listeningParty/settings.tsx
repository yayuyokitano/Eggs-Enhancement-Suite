import { LocalPlaybackController } from "../../player/playback";
import PlaybackController from "../../player/playbackController";
import { useEffect, useState } from "react";
import { TFunction } from "react-i18next";
import "./settings.scss";

export default function Settings(props: {t: TFunction, playbackController?: PlaybackController}) {
	const { t, playbackController } = props;
	const [, setUpdate] = useState(false);
	useEffect(() => {
		const listener = () => {
			setUpdate(u => !u);
		};

		playbackController?.on("updateSettings", listener);
		return () => {
			playbackController?.off("updateSettings", listener);
		};
	}, []);

	return (
		<div id="ees-listening-party-settings">
			<h4>{t("listeningParty.settings")}</h4>
			<form
				id="ees-listening-party-title-change-form"
				onSubmit={(e) => {
					e.preventDefault();
					if (!playbackController) return;
					const titleInput = document.getElementById("ees-listening-party-title-change") as HTMLInputElement;
					playbackController.title = titleInput.value;
					titleInput.value = "";
				}}>
				<label htmlFor="ees-listening-party-title-change">{t("listeningParty.name")}</label>
				<input
					type="text"
					id="ees-listening-party-title-change"
					placeholder={t("listeningParty.namePlaceholder")}
					disabled={!(playbackController instanceof LocalPlaybackController)}
				/>
				<button
					type="submit"
					id="ees-listening-party-title-change-button"
					disabled={!(playbackController instanceof LocalPlaybackController)}>{t("listeningParty.changeName")}</button>
			</form>
			<div id="ees-listening-party-settings-buttons">
				<div className="ees-listening-party-settings-button">
					<input
						type="checkbox"
						id="ees-listening-party-play-suggestions"
						checked={playbackController?.playSuggestions ?? false}
						onChange={(e) => {
							if (!playbackController) return;
							playbackController.playSuggestions = e.target.checked;
						}}
						disabled={!(playbackController instanceof LocalPlaybackController)}
					/>
					<label htmlFor="ees-listening-party-play-suggestions">{t("listeningParty.playSuggestions")}</label>
				</div>
			</div>
		</div>
	);
}