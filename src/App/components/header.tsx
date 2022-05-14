import { getToken } from "../../util/util";
import { profile } from "../../util/wrapper/eggs/users";
import React, { useEffect, useState } from "react";
import "../../i18n/config";
import { useTranslation } from "react-i18next";
import "./header.scss";
import { t } from "i18next";

interface User {
  displayName: string;
  imageDataPath: string | null;
  userName: string;
  isLoggedIn: boolean;
}

const DEFAULT_AVATAR = "https://eggs.mu/wp-content/themes/eggs/assets/img/common/signin.png";
const Logo = () => (
  <div className="logo">
    <a href="/">
      <img src="//resource.lap.recochoku.jp/e8/assets/v2/img/common/logo.png" alt={t("general.logoAlt")} />
    </a>
  </div>
);

function expandGlobalNav() {
  const globalNav = document.getElementsByClassName("globalnav")[0];
  if (globalNav) {
    globalNav.classList.toggle("hidden");
  }
}

function expandSubmenu(e: React.MouseEvent<HTMLElement, MouseEvent>) {
  e.currentTarget.classList.toggle("open");
  e.currentTarget.getElementsByClassName("gn_submenu")[0].classList.remove("transitioned");
}

function addTransitioned(e: React.AnimationEvent<HTMLElement>) {
  e.currentTarget.getElementsByClassName("gn_submenu")[0].classList.add("transitioned");
}

export function HeaderSubmenu() {

  const {t} = useTranslation(["global"]);

  const [user, setUser] = useState<User>({
    displayName: "",
    imageDataPath: null,
    userName: "",
    isLoggedIn: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getToken().then((token) => {
      user.isLoggedIn = token.token !== undefined;
      setUser(user);
      if (!user.isLoggedIn) {
        setLoading(false);
        return;
      }
      profile().then((prof) => {
        user.displayName = prof.data.displayName;
        user.imageDataPath = prof.data.imageDataPath;
        user.userName = prof.data.userName;
        setUser(user);
        setLoading(false);
      });
    });
  });

  if (loading) return <span>{t("general.loading")}</span>;

  if (!user.isLoggedIn) {
    return (
      <div id="ees-login">
        
      </div>
    );
  }
  return (
    <nav id="ees-header">
      <div id="nav-toggle" onClick={expandGlobalNav}>
        <div>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
      <Logo />
      <ul className="globalnav hidden">
        <li id="gn_about"><a href="/about"><span>{t("nav.about")}</span></a></li>
        <li id="gn_project"><a href="/music/projects"><span>{t("nav.projects")}</span></a></li>
        <li id="gn_artist" className="ees-submenu-parent" onClick={expandSubmenu} onAnimationEnd={addTransitioned}>
          <span><span>{t("nav.news.title")}</span></span>
          <ul className="gn_submenu transitioned">
            <li><a href="/music/category/tower"><span>{t("nav.news.towerPush")}</span></a></li>
            <li><a href="/music/category/report"><span>{t("nav.news.liveReport")}</span></a></li>
            <li><a href="/music/category/column"><span>{t("nav.news.column")}</span></a></li>
            <li><a href="/music/category/curator"><span>{t("nav.news.curator")}</span></a></li>
            <li><a href="/music/category/interview"><span>{t("nav.news.interview")}</span></a></li>
            <li><a href="/music/category/news"><span>{t("nav.news.news")}</span></a></li>
          </ul>
        </li>
        <li id="gn_artist" className="ees-submenu-parent" onClick={expandSubmenu} onAnimationEnd={addTransitioned}>
          <span><span>{t("nav.ranking")}</span></span>
          <ul className="gn_submenu transitioned">
            <li><a href="/ranking/artist/daily"><span>{t("general.artist.plural")}</span></a></li>
            <li><a href="/ranking/song/daily"><span>{t("general.song.plural")}</span></a></li>
            <li><a href="/ranking/youtube/daily"><span>YouTube</span></a></li>
          </ul>
        </li>
      </ul>
      <img className="ees-icon" src={user.imageDataPath ?? DEFAULT_AVATAR} />
      <span className="ees-username">{user.displayName}</span>
    </nav>
  );
}