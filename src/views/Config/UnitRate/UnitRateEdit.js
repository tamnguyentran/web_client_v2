import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import NumberFormat from "react-number-format";
import { useHotkeys } from "react-hotkeys-hook";
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Grid,
  //   Button,
  //   TextField,
  Dialog,
} from "@material-ui/core";

// import ExitToAppIcon from "@material-ui/icons/ExitToApp";
// import SaveIcon from "@material-ui/icons/Save";
// import Product_Autocomplete from "../../Products/Product/Control/Product.Autocomplete";
// import Unit_Autocomplete from "../Unit/Control/Unit.Autocomplete";

import glb_sv from "../../../utils/service/global_service";
import control_sv from "../../../utils/service/control_services";
import { config } from "./Modal/UnitRate.modal";
import SnackBarService from "../../../utils/service/snackbar_service";
import sendRequest from "../../../utils/service/sendReq";
import reqFunction from "../../../utils/constan/functions";

// import LoopIcon from "@material-ui/icons/Loop";
import { Unit, Product } from "../../../components/Autocomplete";
import { TextFieldCpn, ButtonCpn } from "../../../basicComponents";

const serviceInfo = {
  GET_UNIT_RATE_BY_ID: {
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
  GET_PRODUCT_INFO: {
    functionName: "get_imp_info",
    reqFunct: reqFunction.GET_PRODUCT_IMPORT_INFO,
    biz: "common",
    object: "products",
  },
};

const UnitRateEdit = ({
  id,
  shouldOpenModal,
  setShouldOpenModal,
  onRefresh,
}) => {
  const { t } = useTranslation();

  const [unitRate, setUnitRate] = useState({});
  const [minUnit, setMinUnit] = useState(null);
  const [process, setProcess] = useState(false);
  const [controlTimeOutKey, setControlTimeOutKey] = useState(null);
  const step1Ref = useRef(null);

  useHotkeys("f3", () => handleUpdate(), {
    enableOnTags: ["INPUT", "SELECT", "TEXTAREA"],
  });
  useHotkeys(
    "esc",
    () => {
      setShouldOpenModal(false);
      setUnitRate({});
    },
    { enableOnTags: ["INPUT", "SELECT", "TEXTAREA"] }
  );

  useEffect(() => {
    if (shouldOpenModal && id && id !== 0) {
      setUnitRate({});
      sendRequest(
        serviceInfo.GET_UNIT_RATE_BY_ID,
        [id],
        handleResultGetUnitRateByID,
        true,
        handleTimeOut
      );
    }
  }, [shouldOpenModal]);

  const handleResultGetUnitRateByID = (reqInfoMap, message) => {
    if (message["PROC_STATUS"] !== 1) {
      // xử lý thất bại
      const cltSeqResult = message["REQUEST_SEQ"];
      glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap);
      control_sv.clearReqInfoMapRequest(cltSeqResult);
      setTimeout(() => {
        if (step1Ref.current) step1Ref.current.focus();
      }, 100);
    } else if (message["PROC_DATA"]) {
      let newData = message["PROC_DATA"];
      setUnitRate(newData.rows[0]);
      sendRequest(
        serviceInfo.GET_PRODUCT_INFO,
        [newData.rows[0].o_2],
        handleResultGetProductInfo,
        true,
        handleTimeOut
      );
    }
  };

  const handleResultGetProductInfo = (reqInfoMap, message) => {
    if (message["PROC_STATUS"] !== 1) {
      // xử lý thất bại
      const cltSeqResult = message["REQUEST_SEQ"];
      glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap);
      control_sv.clearReqInfoMapRequest(cltSeqResult);
    } else if (message["PROC_DATA"]) {
      let data = message["PROC_DATA"];
      setMinUnit(data.rows[0]?.o_1 || null);
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
    } else if (message["PROC_DATA"]) {
      setShouldOpenModal(false);
      onRefresh();
    }
  };

  const handleUpdate = () => {
    if (checkValidate()) return;
    setProcess(true);
    const inputParam = [unitRate.o_1, unitRate.o_6];
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
    if (unitRate.o_6 && unitRate.o_6 > 0) {
      return false;
    }
    return true;
  };

  const handleChange = (e) => {
    const newUnitRate = { ...unitRate };
    newUnitRate["o_6"] = Number(glb_sv.filterNumber(e.target.value));
    setUnitRate(newUnitRate);
  };

  return (
    <Dialog
      fullWidth={true}
      maxWidth="sm"
      open={shouldOpenModal}
      // onClose={e => {
      //     setShouldOpenModal(false)
      // }}
    >
      <Card>
        <CardHeader
          className="card-header"
          title={t("config.unitRate.titleEdit", { name: unitRate.o_3 })}
        />
        <CardContent>
          <Grid container spacing={1}>
            <Grid item xs={12} sm={12}>
              {/* <Product_Autocomplete
                disabled={true}
                value={unitRate.o_3}
                style={{ marginTop: 8, marginBottom: 4 }}
                size={"small"}
                label={t("menu.product")}
              /> */}
              <Product
                size={"small"}
                label={t("menu.product")}
                disabled={true}
                inputRef={step1Ref}
                value={unitRate.o_3}
              />
            </Grid>
            <Grid item xs={6} sm={4}>
              <Unit
                size={"small"}
                label={t("menu.configUnit")}
                disabled={true}
                value={unitRate.o_5}
                // onSelect={handleSelectUnit}
                // inputRef={step2Ref}
                // onKeyPress={(event) => {
                //   if (event.key === "Enter") {
                //     // step3Ref.current.focus();
                //   }
                // }}
              />
              {/* <Unit_Autocomplete
                disabled={true}
                value={unitRate.o_5}
                style={{ marginTop: 8, marginBottom: 4 }}
                size={"small"}
                label={t("menu.configUnit")}
              /> */}
            </Grid>
            <Grid item xs={6} sm={4}>
              <TextFieldCpn
                label={t("Số lượng quy đổi (*)")}
                onChange={handleChange}
                onFocus={(e) => e.target.select()}
                inputRef={step1Ref}
                value={glb_sv.formatValue(unitRate.o_6 || 0, "currency")}
                onKeyPress={(event) => {
                  if (event.key === "Enter") {
                    handleUpdate();
                  }
                }}
              />
              {/* <NumberFormat
                className="inputNumber"
                style={{ width: "100%" }}
                required
                value={unitRate.o_6 || 0}
                label={t("config.unitRate.rate")}
                customInput={TextField}
                autoComplete="off"
                margin="dense"
                type="text"
                variant="outlined"
                thousandSeparator={true}
                onValueChange={handleChange}
                onFocus={(e) => e.target.select()}
                inputRef={step1Ref}
                onKeyPress={(event) => {
                  if (event.key === "Enter") {
                    handleUpdate();
                  }
                }}
                inputProps={{
                  min: 0,
                }}
              /> */}
            </Grid>
            <Grid item xs={6} sm={4}>
              <Unit
                disabled={true}
                unitID={minUnit || null}
                size={"small"}
                label={t("min_unit")}
              />
              {/* <Unit_Autocomplete
                disabled={true}
                unitID={minUnit || null}
                style={{ marginTop: 8, marginBottom: 4 }}
                size={"small"}
                label={t("min_unit")}
              /> */}
            </Grid>
          </Grid>
        </CardContent>
        <CardActions
          className="align-items-end"
          style={{ justifyContent: "flex-end" }}
        >
          {/* <Button
            size="small"
            onClick={(e) => {
              if (process) return;
              setShouldOpenModal(false);
              setUnitRate({});
            }}
            variant="contained"
            disableElevation
            startIcon={<ExitToAppIcon />}
          >
            {t("btn.close")} (Esc)
          </Button> */}
          <ButtonCpn.ButtonClose
            process={process}
            onClick={() => {
              if (process) return;
              setShouldOpenModal(false);
              setUnitRate({});
            }}
          />
          <ButtonCpn.ButtonUpdate
            title="Lưu (F3)"
            onClick={handleUpdate}
            process={process}
            disabled={checkValidate()}
          />
          {/* <Button
            size="small"
            onClick={() => {
              handleUpdate();
            }}
            variant="contained"
            disabled={checkValidate()}
            className={
              checkValidate() === false
                ? process
                  ? "button-loading bg-success text-white"
                  : "bg-success text-white"
                : ""
            }
            startIcon={process ? <LoopIcon /> : <SaveIcon />}
          >
            {t("btn.update")} (F3)
          </Button> */}
        </CardActions>
      </Card>
    </Dialog>
  );
};

export default UnitRateEdit;
