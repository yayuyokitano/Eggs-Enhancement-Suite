import { useEffect, useState } from "react";
import { TFunction } from "react-i18next";
import { getPlaylists } from "../../util/wrapper/eggs/playlists";
import { Profile, profile } from "../../util/wrapper/eggs/users";

export default function Profile(t:TFunction) {
  const userID = location.href.split("/").at(-1);
  let [isLoading, setLoading] = useState(true);
  let [isSelf, setSelf] = useState(false);
  let [user, setUser] = useState<Profile>();

  useEffect(() => {
    profile().then((user) => {
      setSelf(user.data.userName === userID);
      if (self) {
        getPlaylists(5).then((playlists) => {
          console.log(playlists);
        });
      }
      setUser(user);
      setLoading(false);
    });
  }, []);

  if (isLoading) return <div>{t("general.loading")}</div>;
  if (!user) return <div>{t("general.error")}</div>;

  return (
    <div>
      <h1>{user.data.displayName}</h1>
    </div>
  );

  
}