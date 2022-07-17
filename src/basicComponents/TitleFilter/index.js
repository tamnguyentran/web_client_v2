import React from "react";
import FormatListBulletedIcon from "@material-ui/icons/FormatListBulleted";
import "./style.css";
export default function TitleFilter(props) {
  const {
    className = "",
    label = "",
    style = {},
    icons = <FormatListBulletedIcon />,
  } = props;
  return (
    <div className={`title-filter ${className}`} style={style}>
      {icons} {label}
    </div>
  );
}
