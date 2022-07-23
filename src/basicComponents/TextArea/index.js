import React, { useState } from "react";
import { InputLabel, FormControl } from "@material-ui/core";
import { alpha, styled } from "@material-ui/core/styles";
import "./style.css";
const TextAreaStyle = styled("textarea")(({ theme }) => ({
  "label + &": {
    marginTop: theme.spacing(2.5),
  },
  border: `1px solid var(--gray4)`,
  flexGrow: 1,
  borderRadius: 3,
  fontSize: "14px",
  outline: "none",
  // "&:focus": {
  //   border: `1px solid ${theme.palette.primary.main} !important`,
  //   boxShadow: `${alpha(theme.palette.primary.main, 0.25)} 0 0 0 0.2rem`,
  // },
  "&:hover": {
    border: `1px solid var(--gray4)`,
  },
}));
export default function TextFieldCpn(props) {
  const {
    label = "",
    onChange = () => {},
    className = "",
    placeholder = "",
    value = "",
    inputRef,
    onKeyPress = () => {},
  } = props;
  const [isColorLabel, setIsColorLabel] = useState(false);
  return (
    <FormControl variant="standard" className={className}>
      <div className="text-label-input">{label}</div>
      <TextAreaStyle
        rows={2}
        style={{ padding: "12px" }}
        placeholder={placeholder || label}
        onChange={onChange}
        value={value}
        ref={inputRef}
        onKeyPress={onKeyPress}
        onFocus={() => {
          setIsColorLabel(true);
        }}
        onBlur={() => {
          setIsColorLabel(false);
        }}
      />
    </FormControl>
  );
}
