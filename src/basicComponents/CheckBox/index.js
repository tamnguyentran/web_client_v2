import React from "react";
import { Checkbox, FormControlLabel } from "@material-ui/core";
import "./style.css";

export default function CheckBoxCpn(props) {
  const { style = {}, label = "" } = props;
  return (
    <FormControlLabel
      label={
        <div className="fz13" style={style}>
          {label}
        </div>
      }
      control={<Checkbox className="text-green2" />}
    />
  );
}
