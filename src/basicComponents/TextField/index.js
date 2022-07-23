import React from "react";
import {
  TextField,
  InputLabel,
  FormControl,
  InputBase,
  InputAdornment,
} from "@material-ui/core";
import { ReactComponent as IC_SEARCH } from "../../asset/images/search.svg";
import { alpha, styled } from "@material-ui/core/styles";
import { useTranslation } from "react-i18next";
import "./style.css";
export default function TextFieldCpn(props) {
  const { t } = useTranslation();
  const {
    label = "",
    onChange = () => {},
    className = "",
    placeholder = "",
    value = "",
    autoFocus = false,
    classNameInput = " ",
    onKeyPress = () => {},
    onFocus = () => {},
    inputRef,
  } = props;

  return (
    <FormControl variant="standard" className={`w-100 ${className}`}>
      <div className="text-label-input">{t(label)}</div>
      <input
        onFocus={onFocus}
        className={`input-text-field ${classNameInput}`}
        placeholder={t(placeholder || label)}
        onChange={onChange}
        value={value}
        autoFocus={autoFocus}
        onKeyPress={onKeyPress}
        ref={inputRef}
      />
    </FormControl>
  );
}
