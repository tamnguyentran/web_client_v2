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
  const { className, label, placeholder } = props;
  const [dataSource, setDataSource] = useState([]);
  const [isColorLabel, setIsColorLabel] = useState(false);

  useEffect(() => {
    const inputParam = ["groups", "%"];
    sendRequest(
      serviceInfo.DROPDOWN_LIST,
      inputParam,
      handleResultProductGroupDropDownList,
      true,
      handleTimeOut
    );
  }, []);

  console.log(dataSource);
  const handleResultProductGroupDropDownList = (reqInfoMap, message = {}) => {
    if (message["PROC_STATUS"] !== 1) {
      const cltSeqResult = message["REQUEST_SEQ"];
      glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap);
      control_sv.clearReqInfoMapRequest(cltSeqResult);
    } else if (message["PROC_DATA"]) {
      let newData = message["PROC_DATA"];
      setDataSource(newData.rows);
    }
  };

  const handleTimeOut = (e) => {
    SnackBarService.alert(t(`message.${e.type}`), true, 4, 3000);
  };

  return (
    <FormControl
      variant="standard"
      className={`autocomplete-style w-100 ${className}`}
    >
      <div className="text-label-input">{label}</div>
      <Autocomplete
        className="w-100 mb-3"
        size="small"
        options={dataSource}
        getOptionLabel={(option) => option?.o_2 || ""}
        onFocus={() => {
          setIsColorLabel(true);
        }}
        onBlur={() => {
          setIsColorLabel(false);
        }}
        renderInput={(params) => (
          <TextField
            size="small"
            {...params}
            variant="outlined"
            placeholder={placeholder || label}
          />
        )}
      />
    </FormControl>
  );
}
