import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Breadcrumbs } from "@material-ui/core";
import HomeIcon from "@material-ui/icons/Home";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import style from "./Breadcrumb.module.css";
import { menuList, menuAdmin } from "../../components/Menu1/index";

const RenderBreadcrumb = (props) => {
  const { description } = props;
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
    <>
      <Breadcrumbs
        aria-label="breadcrumb"
        separator={<NavigateNextIcon fontSize="medium" />}
        className="breadcrumb-layout"
        style={{
          color: "var(--black2)",
          fontSize: "1.25rem",
          fontFamily: "manrope",
          fontWeight: "700",
          fontStyle: "normal",
        }}
      >
        {keyActive.map((item, index) => (
          <div
            style={{ color: "var(--black2)" }}
            key={index}
            className={
              "cursor-pointer fw-bold breadText flex aligh-item-center"
            }
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
      <div className="mt-2 text-black fz14">{description}</div>
    </>
  );
};

export default RenderBreadcrumb;
