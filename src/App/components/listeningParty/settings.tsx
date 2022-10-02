import PlaybackController from "App/player/playbackController";
import { TFunction } from "react-i18next";
import "./settings.scss";

export default function Settings(props: {t: TFunction, playbackController?: PlaybackController}) {
	const { t, playbackController } = props;

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
					placeholder={t("listeningParty.namePlaceholder")} />
				<button
					type="submit"
					id="ees-listening-party-title-change-button">{t("listeningParty.changeName")}</button>
			</form>
		</div>
	);
}