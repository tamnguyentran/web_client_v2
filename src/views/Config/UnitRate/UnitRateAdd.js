import React, { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useHotkeys } from "react-hotkeys-hook";
import NumberFormat from "react-number-format";
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Chip,
  Grid,
  Button,
  TextField,
  Dialog,
} from "@material-ui/core";

import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import SaveIcon from "@material-ui/icons/Save";
import CheckIcon from "@material-ui/icons/Check";
import DeleteIcon from "@material-ui/icons/Delete";
import Product_Autocomplete from "../../Products/Product/Control/Product.Autocomplete";
import Unit_Autocomplete from "../Unit/Control/Unit.Autocomplete";

import { Unit, Product } from "../../../components/Autocomplete";
import { TextFieldCpn, ButtonCpn } from "../../../basicComponents";

import glb_sv from "../../../utils/service/global_service";
import control_sv from "../../../utils/service/control_services";
import SnackBarService from "../../../utils/service/snackbar_service";
import reqFunction from "../../../utils/constan/functions";
import sendRequest from "../../../utils/service/sendReq";

import AddIcon from "@material-ui/icons/Add";
import LoopIcon from "@material-ui/icons/Loop";
import { ReactComponent as IC_ADD } from "../../../asset/images/add.svg";

const serviceInfo = {
  CREATE: {
    functionName: "insert",
    reqFunct: reqFunction.UNIT_RATE_CREATE,
    biz: "common",
    object: "units_cvt",
  },
  GET_PRODUCT_INFO: {
    functionName: "get_imp_info",
    reqFunct: reqFunction.GET_PRODUCT_IMPORT_INFO,
    biz: "common",
    object: "products",
  },
};

const UnitRateAdd = ({ onRefresh }) => {
  const { t } = useTranslation();

  const [unitRate, setUnitRate] = useState({});
  const [minUnit, setMinUnit] = useState(null);
  const [shouldOpenModal, setShouldOpenModal] = useState(false);
  const [process, setProcess] = useState(false);
  const saveContinue = useRef(false);

  const [controlTimeOutKey, setControlTimeOutKey] = useState(null);
  const step1Ref = useRef(null);
  const step2Ref = useRef(null);
  const step3Ref = useRef(null);

  useHotkeys("f2", () => setShouldOpenModal(true), {
    enableOnTags: ["INPUT", "SELECT", "TEXTAREA"],
  });
  useHotkeys("f3", () => handleCreate(), {
    enableOnTags: ["INPUT", "SELECT", "TEXTAREA"],
  });
  useHotkeys(
    "f4",
    () => {
      handleCreate();
      saveContinue.current = true;
    },
    { enableOnTags: ["INPUT", "SELECT", "TEXTAREA"] }
  );
  useHotkeys(
    "esc",
    () => {
      setShouldOpenModal(false);
      setUnitRate({});
    },
    { enableOnTags: ["INPUT", "SELECT", "TEXTAREA"] }
  );

  const handleResultCreate = (reqInfoMap, message) => {
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
      setUnitRate({});
      onRefresh();
      if (saveContinue.current) {
        saveContinue.current = false;
        setTimeout(() => {
          if (step1Ref.current) step1Ref.current.focus();
        }, 100);
      } else {
        setShouldOpenModal(false);
      }
    }
  };

  //-- xử lý khi timeout -> ko nhận được phản hồi từ server
  const handleTimeOut = (e) => {
    SnackBarService.alert(t(`message.${e.type}`), true, 4, 3000);
    setProcess(false);
    setControlTimeOutKey(null);
  };

  const handleCreate = () => {
    if (checkValidate()) return;
    setProcess(true);
    const inputParam = [unitRate.product, unitRate.unit, Number(unitRate.rate)];
    setControlTimeOutKey(
      serviceInfo.CREATE.reqFunct + "|" + JSON.stringify(inputParam)
    );
    sendRequest(
      serviceInfo.CREATE,
      inputParam,
      handleResultCreate,
      true,
      handleTimeOut
    );
  };

  const checkValidate = () => {
    if (!!unitRate.product && !!unitRate.unit && unitRate.rate > 0) {
      return false;
    }
    return true;
  };

  const handleSelectProduct = (obj) => {
    const newUnitRate = { ...unitRate };
    newUnitRate["product"] = !!obj ? obj?.o_1 : null;
    setUnitRate(newUnitRate);
    if (!!obj && !!obj.o_2) {
      sendRequest(
        serviceInfo.GET_PRODUCT_INFO,
        [obj.o_1],
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
      // setUnitRate(prev => { return { ...prev, ...{ unit: data.rows[0]?.o_1 || null } } })
    }
  };

  const handleSelectUnit = (obj) => {
    const newUnitRate = { ...unitRate };
    newUnitRate["unit"] = !!obj ? obj?.o_1 : null;
    setUnitRate(newUnitRate);
  };

  const handleChange = (e) => {
    const newUnitRate = { ...unitRate };
    newUnitRate["rate"] = Number(glb_sv.filterNumber(e.target.value));
    setUnitRate(newUnitRate);
  };

  return (
    <>
      <Button
        style={{ height: "40px" }}
        size="medium"
        className="primary-bg text-white"
        variant="contained"
        onClick={() => {
          setShouldOpenModal(true);
        }}
      >
        <IC_ADD className="pr-1" />
        <div>Thêm mới (F2)</div>
      </Button>
      <Dialog
        fullWidth={true}
        maxWidth="sm"
        open={shouldOpenModal}
        // onClose={e => {
        //     setShouldOpenModal(false)
        //     setUnitRate({})
        // }}
      >
        <Card>
          <CardHeader
            className="card-header"
            title={t("config.unitRate.titleAdd")}
          />
          <CardContent>
            <Grid container spacing={1}>
              <Grid item xs={12} sm={12}>
                {/* <Product_Autocomplete
                  autoFocus={true}
                  productID={unitRate.product || null}
                  style={{ marginTop: 8, marginBottom: 4 }}
                  size={"small"}
                  label={t("menu.product")}
                  onSelect={handleSelectProduct}
                  inputRef={step1Ref}
                  onKeyPress={(event) => {
                    if (event.key === "Enter") {
                      step2Ref.current.focus();
                    }
                  }}
                /> */}
                <Product
                  autoFocus={true}
                  productID={unitRate.product || null}
                  size={"small"}
                  label={t("Sản phẩm (*)")}
                  onSelect={handleSelectProduct}
                  inputRef={step1Ref}
                  onKeyPress={(event) => {
                    if (event.key === "Enter") {
                      step2Ref.current.focus();
                    }
                  }}
                />
              </Grid>
              <Grid item xs={6} sm={4}>
                <Unit
                  unitID={unitRate.unit || null}
                  size={"small"}
                  label={t("Đơn vị (*)")}
                  onSelect={handleSelectUnit}
                  inputRef={step2Ref}
                  onKeyPress={(event) => {
                    if (event.key === "Enter") {
                      step3Ref.current.focus();
                    }
                  }}
                />
                {/* <Unit_Autocomplete
                  unitID={unitRate.unit || null}
                  style={{ marginTop: 8, marginBottom: 4 }}
                  size={"small"}
                  label={t("menu.configUnit")}
                  onSelect={handleSelectUnit}
                  inputRef={step2Ref}
                  onKeyPress={(event) => {
                    if (event.key === "Enter") {
                      step3Ref.current.focus();
                    }
                  }}
                /> */}
              </Grid>
              <Grid item xs={6} sm={4}>
                <TextFieldCpn
                  inputRef={step3Ref}
                  label={t("SL quy đổi ra ĐV nhỏ nhất (*)")}
                  onChange={handleChange}
                  value={glb_sv.formatValue(unitRate.rate || 0, "currency")}
                  onFocus={(e) => e.target.select()}
                  onKeyPress={(event) => {
                    if (event.key === "Enter") {
                      handleCreate();
                    }
                  }}
                />
                {/* <NumberFormat
                  className="inputNumber"
                  style={{ width: "100%" }}
                  required
                  value={unitRate.rate || 0}
                  label={t("config.unitRate.rate")}
                  customInput={TextField}
                  autoComplete="off"
                  margin="dense"
                  type="text"
                  variant="outlined"
                  thousandSeparator={true}
                  onValueChange={handleChange}
                  onFocus={(e) => e.target.select()}
                  inputRef={step3Ref}
                  onKeyPress={(event) => {
                    if (event.key === "Enter") {
                      handleCreate();
                    }
                  }}
                  inputProps={{
                    min: 0,
                  }}
                /> */}
              </Grid>
              <Grid item xs={6} sm={4}>
                {/* <Unit
                  disabled={true}
                  unitID={minUnit || null}
                  style={{ marginTop: 8, marginBottom: 4 }}
                  size={"small"}
                  label={t("min_unit")}
                /> */}
                <Unit
                  disabled={true}
                  unitID={minUnit || null}
                  size={"small"}
                  label={t("min_unit")}
                />
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
              startIcon={<ExitToAppIcon />}
              variant="contained"
              disableElevation
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
              onClick={handleCreate}
              process={process}
              disabled={checkValidate()}
            />
            <ButtonCpn.ButtonUpdate
              title="Lưu và tiếp tục"
              onClick={() => {
                saveContinue.current = true;
                handleCreate();
              }}
              process={process}
              disabled={checkValidate()}
            />
            {/* <Button
              size="small"
              onClick={() => {
                handleCreate();
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
              {t("btn.save")} (F3)
            </Button> */}
            {/* <Button
              size="small"
              onClick={() => {
                saveContinue.current = true;
                handleCreate();
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
              {t("config.save_continue")}
            </Button> */}
          </CardActions>
        </Card>
      </Dialog>
    </>
  );
};

export default UnitRateAdd;
