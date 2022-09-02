import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useHotkeys } from "react-hotkeys-hook";
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Dialog,
  Grid,
} from "@material-ui/core";

import SnackBarService from "../../../utils/service/snackbar_service";
import sendRequest from "../../../utils/service/sendReq";
import glb_sv from "../../../utils/service/global_service";
import control_sv from "../../../utils/service/control_services";
import { config } from "./Modal/WarnTime.modal";

import { TextFieldCpn, ButtonCpn, TextAreaCpn } from "../../../basicComponents";
import { Unit, Product, Time } from "../../../components/Autocomplete";

const serviceInfo = {
  GET_WARN_TIME_BY_ID: {
    functionName: config["byId"].functionName,
    reqFunct: config["byId"].reqFunct,
    biz: config.biz,
    object: config.object,
  },
  UPDATE: {
    functionName: config["update"].functionName,
    reqFunct: config["update"].reqFunct,
    biz: config.biz,
    object: config.object,
  },
};

const WarnTimeEdit = ({
  id,
  shouldOpenModal,
  setShouldOpenModal,
  onRefresh,
}) => {
  const { t } = useTranslation();

  const [warnTime, setWarnTime] = useState({});
  const [process, setProcess] = useState(false);
  const [controlTimeOutKey, setControlTimeOutKey] = useState(null);
  const step1Ref = useRef(null);
  const step2Ref = useRef(null);

  useHotkeys("f3", () => handleUpdate(), {
    enableOnTags: ["INPUT", "SELECT", "TEXTAREA"],
  });
  useHotkeys(
    "esc",
    () => {
      if (process) return;
      setShouldOpenModal(false);
      setWarnTime({});
    },
    { enableOnTags: ["INPUT", "SELECT", "TEXTAREA"] }
  );

  useEffect(() => {
    if (shouldOpenModal && id && id !== 0) {
      //   setWarnTime({});
      sendRequest(
        serviceInfo.GET_WARN_TIME_BY_ID,
        [id],
        handleResultGetWarnTimeByID,
        true,
        handleTimeOut
      );
    }
  }, [shouldOpenModal]);

  const handleResultGetWarnTimeByID = (reqInfoMap, message) => {
    if (message["PROC_STATUS"] !== 1) {
      // xử lý thất bại
      const cltSeqResult = message["REQUEST_SEQ"];
      glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap);
      control_sv.clearReqInfoMapRequest(cltSeqResult);
    } else if (message["PROC_DATA"]) {
      let newData = message["PROC_DATA"];
      setWarnTime(newData.rows[0]);
      step1Ref.current.focus();
    }
  };

  const handleResultUpdate = (reqInfoMap, message) => {
    SnackBarService.alert(
      message["PROC_MESSAGE"],
      true,
      message["PROC_STATUS"],
      3000
    );
    setProcess(false);
    setControlTimeOutKey(null);
    if (message["PROC_STATUS"] !== 1) {
      // xử lý thất bại
      const cltSeqResult = message["REQUEST_SEQ"];
      glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap);
      control_sv.clearReqInfoMapRequest(cltSeqResult);
      setTimeout(() => {
        if (step1Ref.current) step1Ref.current.focus();
      }, 100);
    } else if (message["PROC_DATA"]) {
      setShouldOpenModal(false);
      onRefresh();
    }
  };

  const handleUpdate = () => {
    if (checkValidate()) return;
    setProcess(true);
    const inputParam = [warnTime.o_1, warnTime.o_4, warnTime.o_5];
    setControlTimeOutKey(
      serviceInfo.UPDATE.reqFunct + "|" + JSON.stringify(inputParam)
    );
    sendRequest(
      serviceInfo.UPDATE,
      inputParam,
      handleResultUpdate,
      true,
      handleTimeOut
    );
  };

  //-- xử lý khi timeout -> ko nhận được phản hồi từ server
  const handleTimeOut = (e) => {
    SnackBarService.alert(t(`message.${e.type}`), true, 4, 3000);
    setProcess(false);
    setControlTimeOutKey(null);
  };

  const checkValidate = () => {
    if (
      !!warnTime?.o_1 &&
      !!warnTime?.o_4 &&
      warnTime.o_4 > 0 &&
      !!warnTime?.o_5
    ) {
      return false;
    }
    return true;
  };

  const handleChangeAmt = (e) => {
    const newWarnTime = { ...warnTime };
    newWarnTime["o_4"] = Number(e.target.value);
    setWarnTime(newWarnTime);
  };

  const handleChangeTimeTp = (obj) => {
    const newWarnTime = { ...warnTime };
    newWarnTime["o_5"] = !!obj ? obj?.o_1 : null;
    newWarnTime["o_6"] = !!obj ? obj?.o_2 : "";
    setWarnTime(newWarnTime);
  };
  return (
    <Dialog
      fullWidth={true}
      maxWidth="sm"
      open={shouldOpenModal}
    >
      <Card>
        <CardHeader
          className="card-header"
          title={t("config.warnTime.titleEdit", { name: warnTime?.o_3 })}
        />
        <CardContent>
          <Grid container spacing={1}>
            <Grid item xs={12} sm={12}>
              <Product
                disabled={true}
                value={warnTime?.o_3}
                autoFocus={true}
                label={t("Sản phẩm (*)")}
              />
            </Grid>
            <Grid item xs={6} sm={6}>
              <TextFieldCpn
                label={t("Khoảng thời gian tính (*)")}
                onChange={handleChangeAmt}
                value={warnTime?.o_4 || ""}
                onFocus={(e) => e.target.select()}
                inputRef={step1Ref}
                onKeyPress={(event) => {
                  if (event.key === "Enter") {
                    step2Ref.current.focus();
                  }
                }}
              />
            </Grid>
            <Grid item xs={6} sm={6}>
              <Time
                value={warnTime.o_6 || ""}
                label={t("config.warnTime.warn_time_tp")}
                onSelect={handleChangeTimeTp}
                inputRef={step2Ref}
                onKeyPress={(event) => {
                  if (event.key === "Enter") {
                    handleUpdate();
                  }
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
        <CardActions
          className="align-items-end justify-content-end"
        >
          <ButtonCpn.ButtonClose
            process={process}
            onClick={() => {
              if (
                (controlTimeOutKey &&
                  control_sv.ControlTimeOutObj[controlTimeOutKey]) ||
                process
              ) {
                return;
              }
              setShouldOpenModal(false);
            }}
          />
          <ButtonCpn.ButtonUpdate
            title="Lưu (F3)"
            onClick={handleUpdate}
            process={process}
            disabled={checkValidate()}
          />
        </CardActions>
      </Card>
    </Dialog>
  );
};

export default WarnTimeEdit;
