import React, { Suspense, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Breadcrumbs } from "@material-ui/core";
import HomeIcon from "@material-ui/icons/Home";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import style from "./Pages.module.css";
import { Switch, Route, Redirect, useParams } from "react-router-dom";
import LoadingView from "../../components/Loading/View";
import { MenuView, menuList, menuAdmin } from "../../components/Menu/index";
import HeaderView from "../../components/Header/index";

import Dashboard from "../Dashboard/index";
import Config from "../Config/index";
import Report from "../Report/index";
import Partner from "../Partner/index";
import Order from "../Order/index";
import Products from "../Products";
import SettlementLayout from "../Settlement";
import AdminManagementLayout from "../AdminManagement";

import glb_sv from "../../utils/service/global_service";

const baseLink = "/page/";

function Child() {
  let { link } = useParams();

  switch (link) {
    case "dashboard":
      return <Dashboard />;
    case "order":
      return <Order />;
    case "partner":
      return <Partner />;
    case "report":
      return <Report />;
    case "config":
      return <Config />;
    case "products":
      return <Products />;
    case "settlement":
      return <SettlementLayout />;
    case "management":
      return <AdminManagementLayout />;
    default:
      break;
  }
}

const RenderBreadcrumb = () => {
  const history = useHistory();
  const { t } = useTranslation();
  const [commitMenu, setCommitMenu] = useState([...menuList, ...menuAdmin]);

  let keyActive = window.location.pathname.split("/").filter((x) => x);
  let topItem = commitMenu.find((x) => x.key === keyActive[1]);
  let childItem =
    !!topItem &&
    !!topItem.children &&
    topItem.children.find((x) => x.link === keyActive.slice(1).join("/"));

  return (
    <Breadcrumbs
      aria-label="breadcrumb"
      separator={<NavigateNextIcon fontSize="small" />}
      className="breadcrumb-layout"
      style={{ marginBottom: "0.5rem" }}
    >
      <header className="w-100">
        <HeaderView />
      </header>
      {keyActive.map((item, index) => (
        <div
          className={"cursor-pointer fw-bold breadText"}
          onClick={() =>
            history.push(`/${keyActive.slice(0, index + 1).join("/")}`)
          }
          color="inherit"
          // href={`/${keyActive.slice(0, index + 1).join('/')}`}
        >
          {index === 0 && <HomeIcon className={style.icon} />}
          {index === 1 && topItem ? t(topItem.title) : ""}
          {index === 2 && childItem ? t(childItem.title) : ""}
        </div>
      ))}
    </Breadcrumbs>
  );
};

const Page = () => {
  const history = useHistory();

  useEffect(() => {
    if (!glb_sv.authFlag) {
      history.push("/login");
    }
  }, []);

  return (
    <div className={style.app_page}>
      <div className="d-flex w-100">
        <div id="menu_view">
          <MenuView baseLink={baseLink} />
        </div>
        <div
          className={"w-100 " + style.bgLightCustome}
          style={{ maxWidth: `calc(100vw - 100px)` }}
        >
          {/* <header className="w-100">
                        <HeaderView />
                    </header> */}
          <div className="container-fluid">
            <div className={["p-3", style.contentPage].join(" ")}>
              <Suspense fallback={<LoadingView />}>
                {/* <RenderBreadcrumb /> */}
                <Switch>
                  <Route path="/page/:link" children={<Child />} />
                  <Redirect
                    to={{ pathname: "/page/dashboard", state: { from: "/" } }}
                  />
                </Switch>
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
