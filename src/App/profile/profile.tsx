import { useEffect, useState } from "react";
import { TFunction } from "react-i18next";
import { profile } from "../../util/wrapper/eggs/users";
import OtherProfile from "./otherProfile";
import SelfProfile from "./selfProfile";

export default function Profile(t:TFunction) {
  const userID = location.href.split("/").at(-1);
  let [isLoading, setLoading] = useState(true);
  let [isSelf, setSelf] = useState(false);

  useEffect(() => {
    profile().then((data) => {
      setSelf(data.data.userName === userID)
      setLoading(false);
    });
  }, []);

  if (isLoading) return <div>{t("general.loading")}</div>;

  if (isSelf) return <SelfProfile t={t} />
  return <OtherProfile t={t} />
}