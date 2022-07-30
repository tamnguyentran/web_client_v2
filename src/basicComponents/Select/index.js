import React from "react";
import { Select, MenuItem, FormControl } from "@material-ui/core";

export default function SelectCpn(props) {
  const {
    value,
    onChange,
    onKeyPress,
    label = "",
    name = "",
    children,
  } = props;
  return (
    <FormControl margin="dense" variant="outlined" className="w-100">
      <div className="text-label-input">{label}</div>
      <Select
        className="custom-input"
        value={value}
        onChange={onChange}
        onKeyPress={onKeyPress}
        name={name}
      >
        {children}
      </Select>
    </FormControl>
  );
}
