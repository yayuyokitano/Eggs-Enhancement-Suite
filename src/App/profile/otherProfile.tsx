import { TFunction } from "react-i18next";

export default function OtherProfile(props: {t:TFunction}) {
  const { t } = props;
  const userID = location.href.split("/").at(-1);
  return (
    <h1>{t("popup.helloWorld")}{userID}</h1>
  )
}