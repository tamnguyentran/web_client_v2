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

import Product_Autocomplete from "../../Products/Product/Control/Product.Autocomplete";
import WarnTimeAutocompelte from "./Control/WarnTime.Autocomplete";

import glb_sv from "../../../utils/service/global_service";
import control_sv from "../../../utils/service/control_services";
import SnackBarService from "../../../utils/service/snackbar_service";
import reqFunction from "../../../utils/constan/functions";
import sendRequest from "../../../utils/service/sendReq";

import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import SaveIcon from "@material-ui/icons/Save";
import CheckIcon from "@material-ui/icons/Check";
import DeleteIcon from "@material-ui/icons/Delete";
import AddIcon from "@material-ui/icons/Add";
import LoopIcon from "@material-ui/icons/Loop";
import { Unit, Product, Time } from "../../../components/Autocomplete";
import { ReactComponent as IC_ADD } from "../../../asset/images/add.svg";
import { TextFieldCpn, ButtonCpn, TextAreaCpn } from "../../../basicComponents";

const serviceInfo = {
  CREATE: {
    functionName: "insert",
    reqFunct: reqFunction.WARN_TIME_CREATE,
    biz: "common",
    object: "conf_expiredt",
  },
};

const WarnTimeAdd = ({ onRefresh }) => {
  const { t } = useTranslation();

  const [warnTime, setWarnTime] = useState({});
  const [productSelect, setProductSelect] = useState("");
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
      if (process) return;
      setShouldOpenModal(false);
      setWarnTime({});
      setProductSelect("");
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
      setWarnTime({});
      setProductSelect("");
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
    const inputParam = [
      warnTime.product,
      Number(warnTime.warn_amt),
      warnTime.warn_time_tp,
    ];
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
    if (
      !!warnTime.product &&
      !!warnTime.warn_amt &&
      warnTime.warn_amt > 0 &&
      !!warnTime.warn_time_tp
    ) {
      return false;
    }
    return true;
  };

  const handleSelectProduct = (obj) => {
    const newWarnTime = { ...warnTime };
    newWarnTime["product"] = !!obj ? obj?.o_1 : null;
    setWarnTime(newWarnTime);
    setProductSelect(!!obj ? obj?.o_2 : "");
  };

  const handleChangeAmt = (e) => {
    const newWarnTime = { ...warnTime };
    newWarnTime["warn_amt"] =
      Number(e.target.value) >= 0 && Number(e.target.value) <= 100
        ? Number(e.target.value)
        : 1;
    setWarnTime(newWarnTime);
  };

  const handleChangeTimeTp = (obj) => {
    const newWarnTime = { ...warnTime };
    newWarnTime["warn_time_tp"] = !!obj ? obj?.o_1 : null;
    newWarnTime["warn_time_nm"] = !!obj ? obj?.o_2 : "";
    setWarnTime(newWarnTime);
  };

  return (
    <>
      {/* <Button
        size="small"
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={() => setShouldOpenModal(true)}
        style={{
          color: "var(--white)",
          border: "1px solid white",
          maxHeight: 22,
        }}
      >
        Thêm mới (F2)
      </Button> */}
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
        // }}
      >
        <Card>
          <CardHeader
            className="card-header"
            title={t("config.warnTime.titleAdd")}
          />
          <CardContent>
            <Grid container spacing={1}>
              <Grid item xs={12}>
                {/* <Product_Autocomplete
                  autoFocus={true}
                  value={productSelect || ""}
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
                  value={productSelect || ""}
                  autoFocus={true}
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
              <Grid item xs={6}>
                {/* <NumberFormat
                  className="inputNumber"
                  style={{ width: "100%" }}
                  required
                  value={warnTime.warn_amt || ""}
                  label={t("config.warnTime.warn_amt")}
                  customInput={TextField}
                  autoComplete="off"
                  margin="dense"
                  type="text"
                  variant="outlined"
                  thousandSeparator={true}
                  onValueChange={handleChangeAmt}
                  inputProps={{
                    min: 0,
                  }}
                  inputRef={step2Ref}
                  onFocus={(e) => e.target.select()}
                  onKeyPress={(event) => {
                    if (event.key === "Enter") {
                      step3Ref.current.focus();
                    }
                  }}
                /> */}
                <TextFieldCpn
                  label={t("Khoảng thời gian tính (*)")}
                  onChange={handleChangeAmt}
                  value={warnTime.warn_amt || ""}
                  onFocus={(e) => e.target.select()}
                  inputRef={step2Ref}
                  onKeyPress={(event) => {
                    if (event.key === "Enter") {
                      step3Ref.current.focus();
                    }
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <Time
                  defaultSelect={true}
                  value={warnTime.warn_time_nm || ""}
                  autoFocus={true}
                  label={t("config.warnTime.warn_time_tp")}
                  onSelect={handleChangeTimeTp}
                  inputRef={step3Ref}
                  onKeyPress={(event) => {
                    if (event.key === "Enter") {
                      handleCreate();
                    }
                  }}
                />
                {/* <WarnTimeAutocompelte
                  // defaultSelect={true}
                  value={warnTime.warn_time_nm || ""}
                  diectionName="warn_time_tp"
                  style={{ marginTop: 8, marginBottom: 4 }}
                  size={"small"}
                  label={t("config.warnTime.warn_time_tp")}
                  onSelect={handleChangeTimeTp}
                  inputRef={step3Ref}
                  onKeyPress={(event) => {
                    if (event.key === "Enter") {
                      handleCreate();
                    }
                  }}
                /> */}
              </Grid>
            </Grid>
          </CardContent>
          <CardActions className="align-items-end justify-content-end">
            {/* <Button
              size="small"
              onClick={(e) => {
                if (
                  (controlTimeOutKey &&
                    control_sv.ControlTimeOutObj[controlTimeOutKey]) ||
                  process
                ) {
                  return;
                }
                setShouldOpenModal(false);
              }}
              startIcon={<ExitToAppIcon />}
              variant="contained"
              disableElevation
            >
              {t("btn.close")} (Esc)
            </Button>
            <Button
              size="small"
              onClick={() => {
                if (process) return;
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
              endIcon={process && <LoopIcon />}
              startIcon={<SaveIcon />}
            >
              {t("btn.save")} (F3)
            </Button>
            <Button
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
              endIcon={process && <LoopIcon />}
              startIcon={<SaveIcon />}
            >
              {t("save_continue")} (F4)
            </Button> */}
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
              onClick={handleCreate}
              process={process}
              disabled={checkValidate()}
            />
            <ButtonCpn.ButtonUpdate
              title="Lưu và tiếp tục (F4)"
              onClick={() => {
                saveContinue.current = true;
                handleCreate();
              }}
              process={process}
              disabled={checkValidate()}
            />
          </CardActions>
        </Card>
      </Dialog>
    </>
  );
};

export default WarnTimeAdd;
