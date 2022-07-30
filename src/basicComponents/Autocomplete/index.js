import React, { useState, useEffect } from "react";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { TextField, FormControl, InputLabel } from "@material-ui/core";
import reqFunction from "../../utils/constan/functions";
import sendRequest from "../../utils/service/sendReq";
import SnackBarService from "../../utils/service/snackbar_service";
import { useTranslation } from "react-i18next";
import glb_sv from "../../utils/service/global_service";
import control_sv from "../../utils/service/control_services";
import "./style.css";

const serviceInfo = {
  DROPDOWN_LIST: {
    functionName: "drop_list",
    reqFunct: reqFunction.PRODUCT_DROPDOWN_LIST,
    biz: "common",
    object: "dropdown_list",
  },
};

export default function AutocompleteCpn(props) {
  const { t } = useTranslation();
  const {
    className = "",
    label = "",
    options = [],
    disabled = false,
    onChange = () => {},
    onInputChange = () => {},
    onKeyPress = () => {},
    value = "",
    size = "small",
    getOptionLabel,
    autoFocus = false,
    inputRef,
    inputValue = "",
  } = props;

  return (
    <FormControl
      variant="standard"
      className={`autocomplete-style w-100 ${className}`}
    >
      <div className="text-label-input">{label}</div>
      <Autocomplete
        className="custom-input w-100"
        size={size}
        options={options}
        autoHighlight={true}
        autoComplete={true}
        disabled={disabled}
        noOptionsText={t("noData")}
        getOptionLabel={getOptionLabel}
        onChange={onChange}
        onInputChange={onInputChange}
        onKeyPress={onKeyPress}
        value={value}
        renderInput={(params) => (
          <TextField
            inputRef={inputRef}
            value={inputValue}
            autoFocus={autoFocus}
            size="small"
            {...params}
            variant="outlined"
          />
        )}
      />
    </FormControl>
  );
}
