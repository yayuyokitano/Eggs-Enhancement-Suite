import { defaultAvatar, getToken } from "../../util/util";
import { profile } from "../../util/wrapper/eggs/users";
import React, { useEffect, useState } from "react";
import "../../i18n/config";
import { TFunction, useTranslation } from "react-i18next";
import "./header.scss";
import { t } from "i18next";
import browser from "webextension-polyfill";

interface User {
  displayName: string;
  imageDataPath: string | null;
  userName: string;
  isLoggedIn: boolean;
}

const Logo = () => (
  <div className="logo">
    <a href="/">
      <img src="//resource.lap.recochoku.jp/e8/assets/v2/img/common/logo.png" alt={t("general.logoAlt")} />
    </a>
  </div>
);

function expandGlobalNav() {
  const globalNav = document.getElementsByClassName("globalnav")[0];
  globalNav.classList.add("loaded");
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

function selectSearchType(e: React.MouseEvent<HTMLLIElement, MouseEvent>) {
  document.querySelectorAll(".artistSearch_tabs>li").forEach((e) => {e.classList.remove("active")})
  e.currentTarget.classList.add("active");

  document.querySelectorAll(".artistSearch_category").forEach((e) => {e.classList.add("hidden"); e.classList.remove("active")});
  const focusElement = document.querySelector(".artistSearch_category." + e.currentTarget.children[0].className);
  
  focusElement?.classList.remove("hidden");
  focusElement?.classList.add("active");
}

function toggleActiveRegion(e: React.MouseEvent<HTMLElement, MouseEvent>) {
  e.currentTarget.classList.toggle("active");
}

export function UserComponent(props:{t:TFunction}) {

  const {t} = props;

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
    <div id="ees-user">
      <img className="ees-icon" src={user.imageDataPath ?? defaultAvatar} />
      <span className="ees-username">{user.displayName}</span>
    </div>
  )
}

function searchOnClick(e:React.MouseEvent<HTMLSpanElement, MouseEvent>) {
  e.currentTarget.classList.toggle("opened");
  document.getElementsByClassName("artistSearchBox")[0].classList.toggle("hidden");
}

export function HeaderSubmenu() {

  const {t, i18n} = useTranslation(["global"]);

  useEffect(() => {
    function handleMessage(message:any) {
      if (message.type === "changeLanguage") {
        console.log("change language to " + message.lang);
        i18n.changeLanguage(message.lang);
      }
    }
    browser.runtime.onMessage.addListener(handleMessage);
    return () => {
      browser.runtime.onMessage.removeListener(handleMessage);
    }
  });
  
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
            <li><a href="/ranking/artist/daily"><span>{t("general.artist.singular")}</span></a></li>
            <li><a href="/ranking/song/daily"><span>{t("general.song.singular")}</span></a></li>
            <li><a href="/ranking/youtube/daily"><span>YouTube</span></a></li>
          </ul>
        </li>
      </ul>
      <div id="ees-right-component">
        <span className="artistSearchBtn close" onClick={searchOnClick}>
          <img src="https://eggs.mu/wp-content/themes/eggs/assets/img/common/icn_search.png" alt="" />
        </span>
        <UserComponent t={t} />
      </div>
      <ArtistSearch t={t} />
    </nav>
  );
}

function ArtistSearch(props: {t:TFunction}) {
  const {t} = props;

  return (
    <div className="artistSearch">
      <div className="artistSearchBox hidden">
        <div className="artistSearchBox_inner">
          <h2 className="ttl_artistSearch">{t("nav.search.artist")}</h2>
          <div className="artistSearch_keyword">
            <h3>{t("nav.search.keyword")}</h3>
            <form id="freewordSearch" action="/search" method="get">
              <input type="text" max="30" name="searchKeyword" placeholder={t("nav.search.placeholder")} className="js-artistSearch" />
              <input type="button" name="artistSearchBtn" value="Search" onClick={(e) => {(e.currentTarget.parentElement as HTMLFormElement).submit() /*changing to submit type breaks eggs css its dumb yes*/}} className="doSearchButton js-artistSearchBtn" />
            </form>
          </div>
          <div className="artistSearch_select">
            <ul className="artistSearch_tabs">
              <li className="active" onClick={selectSearchType}><span className="artistSearch_genre">{t("nav.search.genre")}</span></li>
              <li onClick={selectSearchType}><span className="artistSearch_area">{t("nav.search.prefecture")}</span></li>
            </ul>
            <div className="artistSearch_category artistSearch_genre active">
              <GenreList t={t} len={13} />
            </div>
            <PrefectureList t={t} />
          </div>
        </div>
      </div>
    </div>
  )
}

function GenreList(props: {t:TFunction, len:number}) {

  const {t, len} = props;

  let list = [];
  for (let i = 1; i <= len; i++) {
    list.push(<li key={i}><a href={`/search/genre/fg${i}`}>{t(`genre.${i}`)}</a></li>);
  }

  return (
    <ul>
      {list}
    </ul>
  );

}

function PrefectureList(props: {t:TFunction}) {

  const {t} = props;

  let prefectureID = 1;
  let cumCount = 0;
  let regionElements = [];
  for (let region of regions) {
    cumCount += region.count;
    let prefectureElements = [];
    for (;prefectureID <= cumCount; prefectureID++) {
      prefectureElements.push(
        <li key={prefectureID}>
          <a href={`search/area/${prefectures[prefectureID-1]}`}>{t(`prefecture.${prefectureID}`)}</a>
        </li>
      );
    }
    regionElements.push(
      <div className="artistSearch_areaBox">
        <div className="artistSearch_areaName" onClick={toggleActiveRegion}>{t(`prefecture.region.${region.name}`)}</div>
        <ul>
          {prefectureElements}
        </ul>
      </div>
    );
  }
  return (
    <div className="artistSearch_category artistSearch_area">
      {regionElements}
    </div>
  );

}

const regions = [
  {
    name: "hokkaidoTohoku",
    count: 7
  },
  {
    name: "kanto",
    count: 7
  },
  {
    name: "chubu",
    count: 10
  },
  {
    name: "kansai",
    count: 6
  },
  {
    name: "chugokuShikoku",
    count: 9
  },
  {
    name: "kyushuOkinawa",
    count: 8
  }
];

const prefectures = [
  "HOKKAIDO",
  "AOMORI",
  "IWATE",
  "MIYAGI",
  "AKITA",
  "YAMAGATA",
  "FUKUSHIMA",
  "IBARAKI",
  "TOCHIGI",
  "GUNMA",
  "SAITAMA",
  "CHIBA",
  "TOKYO",
  "KANAGAWA",
  "NIIGATA",
  "TOYAMA",
  "ISHIKAWA",
  "FUKUI",
  "YAMANASHI",
  "NAGANO",
  "GIFU",
  "SHIZUOKA",
  "AICHI",
  "MIE",
  "SHIGA",
  "KYOTO",
  "OSAKA",
  "HYOGO",
  "NARA",
  "WAKAYAMA",
  "TOTTORI",
  "SHIMANE",
  "OKAYAMA",
  "HIROSHIMA",
  "YAMAGUCHI",
  "TOKUSHIMA",
  "KAGAWA",
  "EHIME",
  "KOCHI",
  "FUKUOKA",
  "SAGA",
  "NAGASAKI",
  "KUMAMOTO",
  "OITA",
  "MIYAZAKI",
  "KAGOSHIMA",
  "OKINAWA"
];