import { TFunction } from "react-i18next";

export default function SelfProfile(props: {t:TFunction}) {
  const { t } = props;
  return (
    <h1>{t("general.error")}</h1>
  )
}