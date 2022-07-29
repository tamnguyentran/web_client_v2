import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import SnackBarService from "../../utils/service/snackbar_service";
import sendRequest from "../../utils/service/sendReq";
import reqFunction from "../../utils/constan/functions";
import glb_sv from "../../utils/service/global_service";
import control_sv from "../../utils/service/control_services";
import { AutocompleteCpn } from "../../basicComponents";

const serviceInfo = {
  DROPDOWN_LIST: {
    functionName: "dictionary",
    reqFunct: reqFunction.WARN_TIME_DICTIONNARY,
    biz: "common",
    object: "dropdown_list",
  },
};

const TimeAutocomplete = ({
  onSelect,
  defaultSelect = false,
  label,
  style,
  size,
  value,
  required = false,
  dictionaryID = null,
  disabled = false,
  onKeyPress = () => null,
  inputRef = null,
  placeholder = "",
}) => {
  const { t } = useTranslation();

  const [dataSource, setDataSource] = useState([]);
  const [valueSelect, setValueSelect] = useState({});
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    const inputParam = ["warn_time_tp"];
    sendRequest(
      serviceInfo.DROPDOWN_LIST,
      inputParam,
      handleResultDictionnaryDropDownList,
      true,
      handleTimeOut
    );
  }, []);

  useEffect(() => {
    if (!!dictionaryID && dictionaryID !== 0) {
      let item = dataSource.find((x) => x.o_1 === dictionaryID);
      setValueSelect(item);
      setInputValue(item.o_2);
    } else {
      setValueSelect({});
    }
  }, [dictionaryID, dataSource]);

  useEffect(() => {
    if (value !== null || value !== undefined) {
      setValueSelect(dataSource.find((x) => x.o_2 === value));
      setInputValue(value);
    }
  }, [value, dataSource]);

  const handleResultDictionnaryDropDownList = (reqInfoMap, message) => {
    if (message["PROC_STATUS"] !== 1) {
      // xử lý thất bại
      const cltSeqResult = message["REQUEST_SEQ"];
      glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap);
      control_sv.clearReqInfoMapRequest(cltSeqResult);
    } else if (message["PROC_DATA"]) {
      let newData = message["PROC_DATA"];
      setDataSource(newData.rows);
      if (defaultSelect) {
        setValueSelect(newData.rows[2]);
        onSelect(newData.rows[2]);
      }
    }
  };

  //-- xử lý khi timeout -> ko nhận được phản hồi từ server
  const handleTimeOut = (e) => {
    SnackBarService.alert(t(`message.${e.type}`), true, 4, 3000);
  };

  const handleChangeInput = (event, value, reson) => {
    setInputValue(value);
  };

  const onChange = (event, object, reson) => {
    setValueSelect(object);
    onSelect(object);
    setInputValue(object.o_2);
  };

  return (
    // <Autocomplete
    //   margin="dense"
    //   disabled={disabled}
    //   onChange={onChange}
    //   onInputChange={handleChangeInput}
    //   onKeyPress={onKeyPress}
    //   size={!!size ? size : "small"}
    //   id="combo-box-demo"
    //   options={dataSource}
    //   value={valueSelect}
    //   getOptionLabel={(option) => option.o_2 || ""}
    //   inputValue={value}
    //   style={style}
    //   renderInput={(params) => (
    //     <TextField
    //       inputRef={inputRef}
    //       required={required}
    //       value={inputValue}
    //       {...params}
    //       label={!!label ? label : ""}
    //       variant="outlined"
    //     />
    //   )}
    // />
    <AutocompleteCpn
      label={label}
      options={dataSource}
      getOptionLabel={(option) => option?.o_2 || ""}
      disabled={disabled}
      value={valueSelect}
      onChange={onChange}
      onInputChange={handleChangeInput}
      onKeyPress={onKeyPress}
      placeholder={placeholder}
      inputRef={inputRef}
    />
  );
};

export default TimeAutocomplete;
