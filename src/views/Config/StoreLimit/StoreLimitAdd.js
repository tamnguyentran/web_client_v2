import React, { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useHotkeys } from "react-hotkeys-hook";
import NumberFormat from "react-number-format";
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Grid,
  Button,
  TextField,
  Dialog,
} from "@material-ui/core";

// import Product_Autocomplete from "../../Products/Product/Control/Product.Autocomplete";
// import Unit_Autocomplete from "../Unit/Control/Unit.Autocomplete";
// import ExitToAppIcon from "@material-ui/icons/ExitToApp";
// import SaveIcon from "@material-ui/icons/Save";
// import CheckIcon from "@material-ui/icons/Check";
// import DeleteIcon from "@material-ui/icons/Delete";
import { modalDefaultAdd } from "./Modal/StoreLimit.modal";

import glb_sv from "../../../utils/service/global_service";
import control_sv from "../../../utils/service/control_services";
import SnackBarService from "../../../utils/service/snackbar_service";
import reqFunction from "../../../utils/constan/functions";
import sendRequest from "../../../utils/service/sendReq";
import { Unit, Product } from "../../../components/Autocomplete";
import { TextFieldCpn, ButtonCpn } from "../../../basicComponents";
import { ReactComponent as IC_ADD } from "../../../asset/images/add.svg";

import AddIcon from "@material-ui/icons/Add";
// import LoopIcon from "@material-ui/icons/Loop";

const serviceInfo = {
  CREATE: {
    functionName: "insert",
    reqFunct: reqFunction.STORE_LIMIT_CREATE,
    biz: "common",
    object: "store_limit",
  },
  GET_PRODUCT_INFO: {
    functionName: "get_imp_info",
    reqFunct: reqFunction.GET_PRODUCT_IMPORT_INFO,
    biz: "common",
    object: "products",
  },
};

const StoreLimitAdd = ({ onRefresh }) => {
  const { t } = useTranslation();

  const [StoreLimit, setStoreLimit] = useState(modalDefaultAdd);
  const [shouldOpenModal, setShouldOpenModal] = useState(false);
  const [process, setProcess] = useState(false);
  const saveContinue = useRef(false);

  const [controlTimeOutKey, setControlTimeOutKey] = useState(null);
  const step1Ref = useRef(null);
  const step2Ref = useRef(null);
  const step3Ref = useRef(null);
  const step4Ref = useRef(null);

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
      setStoreLimit(modalDefaultAdd);
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
      setStoreLimit(modalDefaultAdd);
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
      StoreLimit.product,
      StoreLimit.unit,
      Number(StoreLimit.minQuantity),
      Number(StoreLimit.maxQuantity),
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
      !!StoreLimit.product &&
      !!StoreLimit.unit &&
      (StoreLimit.minQuantity > 0 || StoreLimit.maxQuantity > 0) &&
      StoreLimit.maxQuantity >= StoreLimit.minQuantity
    ) {
      return false;
    }
    return true;
  };

  const handleSelectProduct = (obj) => {
    const newStoreLimit = { ...StoreLimit };
    newStoreLimit["product"] = !!obj ? obj?.o_1 : null;
    setStoreLimit(newStoreLimit);
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
      setStoreLimit((prev) => {
        return { ...prev, ...{ unit: data.rows[0]?.o_1 || null } };
      });
    }
  };

  const handleSelectUnit = (obj) => {
    const newStoreLimit = { ...StoreLimit };
    newStoreLimit["unit"] = !!obj ? obj?.o_1 : null;
    setStoreLimit(newStoreLimit);
  };

  const handleMinQuantityChange = (e) => {
    console.log(typeof glb_sv.filterNumber(e.target.value));
    const newStoreLimit = { ...StoreLimit };
    newStoreLimit["minQuantity"] =
      glb_sv.filterNumber(e.target.value) >= 0
        ? glb_sv.filterNumber(e.target.value)
        : 10;
    setStoreLimit(newStoreLimit);
  };
  const handleMaxQuantityChange = (e) => {
    const newStoreLimit = { ...StoreLimit };
    newStoreLimit["maxQuantity"] =
      glb_sv.filterNumber(e.target.value) >= 0
        ? glb_sv.filterNumber(e.target.value)
        : 1000;
    setStoreLimit(newStoreLimit);
  };

  return (
    <>
      <Button
        size="medium"
        className="primary-bg text-white h-btn"
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
        //     setStoreLimit({})
        // }}
      >
        <Card>
          <CardHeader
            className="card-header"
            title={t("config.store_limit.titleAdd")}
          />
          <CardContent>
            <Grid container spacing={1}>
              <Grid item xs={6}>
                {/* <Product_Autocomplete
                  autoFocus={true}
                  productID={StoreLimit.product}
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
                  productID={StoreLimit.product || null}
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
              <Grid item xs={6}>
                {/* <Unit_Autocomplete
                  unitID={StoreLimit.unit}
                  style={{ marginTop: 8, marginBottom: 4 }}
                  size={"small"}
                  label={t("menu.configUnit")}
                  onSelect={handleSelectUnit}
                  onFocus={(e) => e.target.select()}
                  inputRef={step2Ref}
                  onKeyPress={(event) => {
                    if (event.key === "Enter") {
                      step3Ref.current.focus();
                    }
                  }}
                /> */}
                <Unit
                  unitID={StoreLimit.unit || null}
                  size={"small"}
                  label={t("Đơn vị (*)")}
                  onSelect={handleSelectUnit}
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
                <TextFieldCpn
                  inputRef={step3Ref}
                  label={t("Hạn mức tối thiểu (*)")}
                  onChange={handleMinQuantityChange}
                  value={glb_sv.formatValue(
                    StoreLimit.minQuantity || 0,
                    "currency"
                  )}
                  onFocus={(e) => e.target.select()}
                  onKeyPress={(event) => {
                    if (event.key === "Enter") {
                      step4Ref.current.focus();
                    }
                  }}
                />
                {/* <NumberFormat
                  className="inputNumber"
                  style={{ width: "100%" }}
                  required
                  value={StoreLimit.minQuantity}
                  label={t("config.store_limit.minQuantity")}
                  customInput={TextField}
                  autoComplete="off"
                  margin="dense"
                  type="text"
                  variant="outlined"
                  thousandSeparator={true}
                  onValueChange={handleMinQuantityChange}
                  inputProps={{
                    min: 0,
                  }}
                  onFocus={(e) => e.target.select()}
                  inputRef={step3Ref}
                  onKeyPress={(event) => {
                    if (event.key === "Enter") {
                      step4Ref.current.focus();
                    }
                  }}
                /> */}
              </Grid>
              <Grid item xs={6}>
                <TextFieldCpn
                  label={t("Hạn mức tối đa (*)")}
                  onChange={handleMaxQuantityChange}
                  value={glb_sv.formatValue(
                    StoreLimit.maxQuantity || 0,
                    "currency"
                  )}
                  onFocus={(e) => e.target.select()}
                  inputRef={step3Ref}
                  onKeyPress={(event) => {
                    if (event.key === "Enter") {
                      handleCreate();
                    }
                  }}
                />
                <div>
                  {StoreLimit.maxQuantity >= StoreLimit.minQuantity ? (
                    ""
                  ) : (
                    <div className="text-orange fz12">
                      {"Phải lớn hơn hạn mức tối thiểu"}
                    </div>
                  )}
                </div>
                {/* <NumberFormat
                  className="inputNumber"
                  style={{ width: "100%" }}
                  required
                  helperText={
                    StoreLimit.maxQuantity >= StoreLimit.minQuantity ? (
                      ""
                    ) : (
                      <div style={{ color: "red" }}>
                        {"phải lớn hơn hạn mức tối thiểu"}
                      </div>
                    )
                  }
                  value={StoreLimit.maxQuantity}
                  label={t("config.store_limit.maxQuantity")}
                  customInput={TextField}
                  autoComplete="off"
                  margin="dense"
                  type="text"
                  variant="outlined"
                  thousandSeparator={true}
                  onValueChange={handleMaxQuantityChange}
                  inputProps={{
                    min: 0,
                  }}
                  onFocus={(e) => e.target.select()}
                  inputRef={step4Ref}
                  onKeyPress={(event) => {
                    if (event.key === "Enter") {
                      handleCreate();
                    }
                  }}
                /> */}
              </Grid>
            </Grid>
          </CardContent>
          <CardActions
            className="align-items-end justify-content-end mr-2 ml-2"
            // style={{ justifyContent: "flex-end" }}
          >
            {/* <Button
              size="small"
              onClick={(e) => {
                if (process) return;
                setShouldOpenModal(false);
                setStoreLimit(modalDefaultAdd);
              }}
              startIcon={<ExitToAppIcon />}
              variant="contained"
              disableElevation
            >
              {t("btn.close")} (Esc)
            </Button> */}
            <ButtonCpn.ButtonClose
              process={process}
              onClick={(e) => {
                if (process) return;
                setShouldOpenModal(false);
                setStoreLimit(modalDefaultAdd);
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

export default StoreLimitAdd;
