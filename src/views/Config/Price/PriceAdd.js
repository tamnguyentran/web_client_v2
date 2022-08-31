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

import glb_sv from "../../../utils/service/global_service";
import control_sv from "../../../utils/service/control_services";
import SnackBarService from "../../../utils/service/snackbar_service";
import reqFunction from "../../../utils/constan/functions";
import sendRequest from "../../../utils/service/sendReq";

import { priceDefaultModal } from "./Modal/Price.modal";

import AddIcon from "@material-ui/icons/Add";
import LoopIcon from "@material-ui/icons/Loop";

import { Unit, Product } from "../../../components/Autocomplete";
import { TextFieldCpn, ButtonCpn, TextAreaCpn } from "../../../basicComponents";
import { ReactComponent as IC_ADD } from "../../../asset/images/add.svg";

const serviceInfo = {
  CREATE: {
    functionName: "insert",
    reqFunct: reqFunction.PRICE_CREATE,
    biz: "common",
    object: "setup_price",
  },
  GET_PRODUCT_INFO: {
    functionName: "get_imp_info",
    reqFunct: reqFunction.GET_PRODUCT_IMPORT_INFO,
    biz: "common",
    object: "products",
  },
};

const PriceAdd = ({ onRefresh }) => {
  const { t } = useTranslation();

  const [Price, setPrice] = useState(priceDefaultModal);
  //   const [productSelect, setProductSelect] = useState("");
  const [unitSelect, setUnitSelect] = useState("");
  const [shouldOpenModal, setShouldOpenModal] = useState(false);
  const [process, setProcess] = useState(false);
  const saveContinue = useRef(false);
  const [controlTimeOutKey, setControlTimeOutKey] = useState(null);
  const step1Ref = useRef(null);
  const step2Ref = useRef(null);
  const step3Ref = useRef(null);
  const step4Ref = useRef(null);
  const step5Ref = useRef(null);
  const step6Ref = useRef(null);
  const step7Ref = useRef(null);
  const step8Ref = useRef(null);

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
      setPrice({ ...priceDefaultModal });
      setUnitSelect("");
      //   setProductSelect("");
    },
    { enableOnTags: ["INPUT", "SELECT", "TEXTAREA"] }
  );

  const handleCreate = () => {
    if (checkValidate()) return;
    setProcess(true);
    const inputParam = [
      Price.product,
      Price.unit,
      Price.importPrice,
      Price.importVAT || 0,
      Price.price,
      Price.wholePrice,
      Price.exportVAT || 0,
      Price.note || "",
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

  //-- xử lý khi timeout -> ko nhận được phản hồi từ server
  const handleTimeOut = (e) => {
    SnackBarService.alert(t(`message.${e.type}`), true, 4, 3000);
    setProcess(false);
    setControlTimeOutKey(null);
  };

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
      setPrice({ ...priceDefaultModal });
      //   setProductSelect("");
      setUnitSelect("");
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

  const checkValidate = () => {
    if (
      !!Price.product &&
      !!Price.unit &&
      Price.importVAT <= 100 &&
      Price.importVAT >= 0 &&
      Price.exportVAT <= 100 &&
      Price.exportVAT >= 0 &&
      (Price.importPrice > 0 || Price.price > 0 || Price.wholePrice > 0)
    ) {
      return false;
    }
    return true;
  };

  const handleSelectProduct = (obj) => {
    const newPrice = { ...Price };
    newPrice["product"] = !!obj ? obj?.o_1 : null;
    // setProductSelect(!!obj ? obj?.o_2 : "");
    setPrice(newPrice);
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
      setPrice((prev) => {
        return { ...prev, ...{ unit: data.rows[0]?.o_1 || null } };
      });
    }
  };

  const handleSelectUnit = (obj) => {
    const newPrice = { ...Price };
    newPrice["unit"] = !!obj ? obj?.o_1 : null;
    setUnitSelect(!!obj ? obj?.o_2 : "");
    setPrice(newPrice);
  };

  const handleChange = (e) => {
    const newPrice = { ...Price };
    newPrice[e.target.name] = e.target.value;
    setPrice(newPrice);
  };

  const handleImportPriceChange = (e) => {
    const newPrice = { ...Price };
    newPrice["importPrice"] = glb_sv.filterNumber(e.target.value);
    setPrice(newPrice);
  };
  const handleImportVATChange = (e) => {
    const newPrice = { ...Price };
    newPrice["importVAT"] =
      glb_sv.filterNumber(e.target.value) >= 0 &&
      glb_sv.filterNumber(e.target.value) < 100
        ? Math.round(glb_sv.filterNumber(e.target.value))
        : 10;
    setPrice(newPrice);
  };
  const handlePriceChange = (e) => {
    const newPrice = { ...Price };
    newPrice["price"] = glb_sv.filterNumber(e.target.value);
    setPrice(newPrice);
  };
  const handleWholePriceChange = (e) => {
    const newPrice = { ...Price };
    newPrice["wholePrice"] = glb_sv.filterNumber(e.target.value);
    setPrice(newPrice);
  };

  const handleExportVATChange = (e) => {
    const newPrice = { ...Price };
    newPrice["exportVAT"] =
      glb_sv.filterNumber(e.target.value) >= 0 &&
      glb_sv.filterNumber(e.target.value) < 100
        ? Math.round(glb_sv.filterNumber(e.target.value))
        : 10;
    setPrice(newPrice);
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
        fullWidth={false}
        maxWidth="xl"
        open={shouldOpenModal}
        // onClose={e => {
        //     setShouldOpenModal(false)
        //     setPrice({ ...priceDefaultModal })
        // }}
      >
        <Card>
          <CardHeader
            className="card-header"
            title={t("config.price.titleAdd")}
          />
          <CardContent>
            <Grid container spacing={1}>
              <Grid item xs={6} sm={12}>
                {/* <Product_Autocomplete
                  autoFocus={true}
                  productID={Price.product || null}
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
                  productID={Price.product || null}
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
              <Grid item xs={6} sm={6}>
                {/* <Unit_Autocomplete
                  unitID={Price.unit || null}
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
                <Unit
                  unitID={Price.unit || null}
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
              <Grid item xs={6} sm={6}>
                <TextFieldCpn
                  label={t("Giá nhập (*)")}
                  onChange={handleImportPriceChange}
                  value={glb_sv.formatValue(Price.importPrice || 0, "currency")}
                  onFocus={(e) => e.target.select()}
                  inputRef={step3Ref}
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
                  value={Price.importPrice || 0}
                  label={t("config.price.importPrice")}
                  customInput={TextField}
                  autoComplete="off"
                  margin="dense"
                  type="text"
                  variant="outlined"
                  thousandSeparator={true}
                  onValueChange={handleImportPriceChange}
                  inputProps={{
                    min: 0,
                  }}
                  inputRef={step3Ref}
                  onFocus={(e) => e.target.select()}
                  onKeyPress={(event) => {
                    if (event.key === "Enter") {
                      step4Ref.current.focus();
                    }
                  }}
                /> */}
              </Grid>
              {/* <Grid item xs={6} sm={4}> */}
                {/* <TextFieldCpn
                  label={t("VAT nhập % (*)")}
                  onChange={handleImportVATChange}
                  value={Price.importVAT || 0}
                  onFocus={(e) => e.target.select()}
                  inputRef={step4Ref}
                  onKeyPress={(event) => {
                    if (event.key === "Enter") {
                      step5Ref.current.focus();
                    }
                  }}
                /> */}
                {/* <NumberFormat
                  className="inputNumber"
                  style={{ width: "100%" }}
                  required
                  value={Price.importVAT || 0}
                  label={t("config.price.importVAT")}
                  customInput={TextField}
                  autoComplete="off"
                  margin="dense"
                  type="text"
                  variant="outlined"
                  suffix="%"
                  thousandSeparator={true}
                  onValueChange={handleImportVATChange}
                  inputProps={{
                    min: 0,
                    max: 100,
                  }}
                  inputRef={step4Ref}
                  onFocus={(e) => e.target.select()}
                  onKeyPress={(event) => {
                    if (event.key === "Enter") {
                      step5Ref.current.focus();
                    }
                  }}
                /> */}
              {/* </Grid> */}
            </Grid>
            <Grid container spacing={1} >
              <Grid item xs>
                <TextFieldCpn
                  label={t("Giá bán lẻ (*)")}
                  onChange={handlePriceChange}
                  value={glb_sv.formatValue(Price.price || 0, "currency")}
                  onFocus={(e) => e.target.select()}
                  inputRef={step5Ref}
                  onKeyPress={(event) => {
                    if (event.key === "Enter") {
                      step6Ref.current.focus();
                    }
                  }}
                />
                {/* <NumberFormat
                  className="inputNumber"
                  style={{ width: "100%" }}
                  required
                  value={Price.price || 0}
                  label={t("config.price.price")}
                  customInput={TextField}
                  autoComplete="off"
                  margin="dense"
                  type="text"
                  variant="outlined"
                  thousandSeparator={true}
                  onValueChange={handlePriceChange}
                  inputProps={{
                    min: 0,
                  }}
                  inputRef={step5Ref}
                  onFocus={(e) => e.target.select()}
                  onKeyPress={(event) => {
                    if (event.key === "Enter") {
                      step6Ref.current.focus();
                    }
                  }}
                /> */}
              </Grid>
              <Grid item xs>
                <TextFieldCpn
                  label={t("Giá bán sĩ (*)")}
                  onChange={handleWholePriceChange}
                  value={glb_sv.formatValue(Price.wholePrice || 0, "currency")}
                  onFocus={(e) => e.target.select()}
                  inputRef={step6Ref}
                  onKeyPress={(event) => {
                    if (event.key === "Enter") {
                      step7Ref.current.focus();
                    }
                  }}
                />
                {/* <NumberFormat
                  className="inputNumber"
                  style={{ width: "100%" }}
                  required
                  value={Price.wholePrice || 0}
                  label={t("config.price.wholePrice")}
                  customInput={TextField}
                  autoComplete="off"
                  margin="dense"
                  type="text"
                  variant="outlined"
                  thousandSeparator={true}
                  onValueChange={handleWholePriceChange}
                  inputProps={{
                    min: 0,
                  }}
                  inputRef={step6Ref}
                  onFocus={(e) => e.target.select()}
                  onKeyPress={(event) => {
                    if (event.key === "Enter") {
                      step7Ref.current.focus();
                    }
                  }}
                /> */}
              </Grid>
              {/* <Grid item xs> */}
                {/* <TextFieldCpn
                  label={t("VAT xuất % (*)")}
                  onChange={handleExportVATChange}
                  value={Price.exportVAT || 0}
                  onFocus={(e) => e.target.select()}
                  inputRef={step7Ref}
                  onKeyPress={(event) => {
                    if (event.key === "Enter") {
                      step8Ref.current.focus();
                    }
                  }}
                /> */}
                {/* <NumberFormat
                  className="inputNumber"
                  style={{ width: "100%" }}
                  required
                  value={Price.exportVAT || 0}
                  label={t("config.price.exportVAT")}
                  customInput={TextField}
                  autoComplete="off"
                  margin="dense"
                  type="text"
                  variant="outlined"
                  suffix="%"
                  thousandSeparator={true}
                  onValueChange={handleExportVATChange}
                  inputProps={{
                    min: 0,
                    max: 100,
                  }}
                  inputRef={step7Ref}
                  onFocus={(e) => e.target.select()}
                  onKeyPress={(event) => {
                    if (event.key === "Enter") {
                      step8Ref.current.focus();
                    }
                  }}
                /> */}
              {/* </Grid> */}
            </Grid>
            <Grid container>
              {/* <TextField
                fullWidth={true}
                margin="dense"
                multiline
                rows={1}
                rowsMax={5}
                autoComplete="off"
                label={t("config.price.note")}
                onChange={handleChange}
                value={Price.note || ""}
                name="note"
                variant="outlined"
                inputRef={step8Ref}
                onFocus={(e) => e.target.select()}
                onKeyPress={(event) => {
                  if (event.key === "Enter") {
                    handleCreate();
                  }
                }}
              /> */}
              <TextAreaCpn
                value={Price.note || ""}
                onChange={handleChange}
                name="note"
                className="w-100 mt-2"
                label="Ghi chú"
                inputRef={step8Ref}
                onKeyPress={(event) => {
                  if (event.key === "Enter") {
                    handleCreate();
                  }
                }}
              />
            </Grid>
          </CardContent>
          <CardActions className="align-items-end justify-content-end">
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
                setPrice({ ...priceDefaultModal });
                // setProductSelect("");
                setUnitSelect("");
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
                setPrice({ ...priceDefaultModal });
                setProductSelect("");
                setUnitSelect("");
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
              {t("config.save_continue")} (F4)
            </Button> */}
          </CardActions>
        </Card>
      </Dialog>
    </>
  );
};

export default PriceAdd;
