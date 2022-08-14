import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useHotkeys } from "react-hotkeys-hook";
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  IconButton,
  Chip,
  Select,
  FormControl,
  MenuItem,
  InputLabel,
  TextField,
  Grid,
  Button,
  Dialog,
} from "@material-ui/core";
import { defaultModalAdd } from "./Modal/Supplier.modal";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import SaveIcon from "@material-ui/icons/Save";
import CheckIcon from "@material-ui/icons/Check";
import DeleteIcon from "@material-ui/icons/Delete";
import Dictionary from "../../../components/Dictionary";

import sendRequest from "../../../utils/service/sendReq";
import glb_sv from "../../../utils/service/global_service";
import control_sv from "../../../utils/service/control_services";
import SnackBarService from "../../../utils/service/snackbar_service";
import reqFunction from "../../../utils/constan/functions";

import AddIcon from "@material-ui/icons/Add";
import LoopIcon from "@material-ui/icons/Loop";

const serviceInfo = {
  CREATE: {
    functionName: "insert",
    reqFunct: reqFunction.SUPPLIER_DELETE,
    biz: "import",
    object: "venders",
  },
};

const SupplierAdd = ({ onRefresh }) => {
  const { t } = useTranslation();

  const [Supplier, setSupplier] = useState({ ...defaultModalAdd });
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
  const step9Ref = useRef(null);
  const step10Ref = useRef(null);
  const step11Ref = useRef(null);
  const step12Ref = useRef(null);
  const step13Ref = useRef(null);
  const step14Ref = useRef(null);
  const step15Ref = useRef(null);

  useHotkeys("f2", () => setShouldOpenModal(true), {
    enableOnTags: ["INPUT", "SELECT", "TEXTAREA"],
  });
  useHotkeys("f3", () => handleCreate(), {
    enableOnTags: ["INPUT", "SELECT", "TEXTAREA"],
  });
  useHotkeys("f4", () => handleCreate(), {
    enableOnTags: ["INPUT", "SELECT", "TEXTAREA"],
  });
  useHotkeys(
    "esc",
    () => {
      setShouldOpenModal(false);
      setSupplier({ ...defaultModalAdd });
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
      setSupplier({ ...defaultModalAdd });
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
    if (!Supplier.cust_nm_v.trim()) return;
    setProcess(true);
    const inputParam = [
      Supplier.vender_nm_v,
      Supplier.vender_nm_e,
      Supplier.vender_nm_short,
      Supplier.address,
      Supplier.phone,
      Supplier.fax,
      Supplier.email,
      Supplier.website,
      Supplier.tax_cd,
      Supplier.bank_acnt_no,
      Supplier.bank_acnt_nm,
      Supplier.bank_cd,
      Supplier.agent_nm,
      Supplier.agent_fun,
      Supplier.agent_address,
      Supplier.agent_phone,
      Supplier.agent_email,
      Supplier.default_yn,
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
    if (!!Supplier.vender_nm_v.trim()) {
      return false;
    }
    return true;
  };

  const handleChange = (e) => {
    const newSupplier = { ...Supplier };
    newSupplier[e.target.name] = e.target.value;
    setSupplier(newSupplier);
  };

  const handleSelectBank = (obj) => {
    const newSupplier = { ...Supplier };
    newSupplier["bank_cd"] = !!obj ? obj?.o_1 : null;
    setSupplier(newSupplier);
  };

  return (
    <>
      <Button
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
      </Button>
      <Dialog
        fullWidth={true}
        maxWidth="md"
        open={shouldOpenModal}
        // onClose={e => {
        //     setShouldOpenModal(false)
        // }}
      >
        <Card>
          <CardHeader title={t("partner.supplier.titleAdd")} />
          <CardContent>
            <Grid container spacing={1}>
              <Grid item xs={6} sm={3}>
                <TextField
                  fullWidth={true}
                  margin="dense"
                  required={true}
                  className="uppercaseInput"
                  autoComplete="off"
                  label={t("partner.supplier.vender_nm_v")}
                  onChange={handleChange}
                  value={Supplier.vender_nm_v || ""}
                  name="vender_nm_v"
                  variant="outlined"
                  autoFocus={true}
                  inputRef={step1Ref}
                  onKeyPress={(event) => {
                    if (event.key === "Enter") {
                      step2Ref.current.focus();
                    }
                  }}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  fullWidth={true}
                  margin="dense"
                  autoComplete="off"
                  label={t("partner.supplier.address")}
                  onChange={handleChange}
                  value={Supplier.address || ""}
                  name="address"
                  variant="outlined"
                  inputRef={step2Ref}
                  onKeyPress={(event) => {
                    if (event.key === "Enter") {
                      step3Ref.current.focus();
                    }
                  }}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  fullWidth={true}
                  margin="dense"
                  autoComplete="off"
                  label={t("partner.supplier.phone")}
                  onChange={handleChange}
                  value={Supplier.phone || ""}
                  name="phone"
                  variant="outlined"
                  inputRef={step3Ref}
                  onKeyPress={(event) => {
                    if (event.key === "Enter") {
                      step4Ref.current.focus();
                    }
                  }}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  fullWidth={true}
                  margin="dense"
                  autoComplete="off"
                  label={t("partner.supplier.fax")}
                  onChange={handleChange}
                  value={Supplier.fax || ""}
                  name="fax"
                  variant="outlined"
                  inputRef={step4Ref}
                  onKeyPress={(event) => {
                    if (event.key === "Enter") {
                      step5Ref.current.focus();
                    }
                  }}
                />
              </Grid>
            </Grid>
            <Grid container spacing={1}>
              <Grid item xs={6} sm={3}>
                <TextField
                  fullWidth={true}
                  margin="dense"
                  autoComplete="off"
                  label={t("partner.supplier.email")}
                  onChange={handleChange}
                  value={Supplier.email || ""}
                  name="email"
                  variant="outlined"
                  inputRef={step5Ref}
                  onKeyPress={(event) => {
                    if (event.key === "Enter") {
                      step6Ref.current.focus();
                    }
                  }}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  fullWidth={true}
                  margin="dense"
                  autoComplete="off"
                  label={t("partner.supplier.website")}
                  onChange={handleChange}
                  value={Supplier.website || ""}
                  name="website"
                  variant="outlined"
                  inputRef={step6Ref}
                  onKeyPress={(event) => {
                    if (event.key === "Enter") {
                      step7Ref.current.focus();
                    }
                  }}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  fullWidth={true}
                  margin="dense"
                  autoComplete="off"
                  label={t("partner.supplier.tax_cd")}
                  onChange={handleChange}
                  value={Supplier.tax_cd || ""}
                  name="tax_cd"
                  variant="outlined"
                  inputRef={step7Ref}
                  onKeyPress={(event) => {
                    if (event.key === "Enter") {
                      step8Ref.current.focus();
                    }
                  }}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  fullWidth={true}
                  margin="dense"
                  autoComplete="off"
                  label={t("partner.supplier.bank_acnt_no")}
                  onChange={handleChange}
                  value={Supplier.bank_acnt_no || ""}
                  name="bank_acnt_no"
                  variant="outlined"
                  inputRef={step8Ref}
                  onKeyPress={(event) => {
                    if (event.key === "Enter") {
                      step9Ref.current.focus();
                    }
                  }}
                />
              </Grid>
            </Grid>
            <Grid container spacing={1}>
              <Grid item xs={6} sm={4}>
                <TextField
                  fullWidth={true}
                  margin="dense"
                  autoComplete="off"
                  label={t("partner.supplier.bank_acnt_nm")}
                  onChange={handleChange}
                  value={Supplier.bank_acnt_nm || ""}
                  name="bank_acnt_nm"
                  variant="outlined"
                  inputRef={step9Ref}
                  onKeyPress={(event) => {
                    if (event.key === "Enter") {
                      step10Ref.current.focus();
                    }
                  }}
                />
              </Grid>
              <Grid item xs={6} sm={4}>
                <Dictionary
                  directionName="bank_cd"
                  onSelect={handleSelectBank}
                  label={t("partner.supplier.bank_cd")}
                  style={{ marginTop: 8, marginBottom: 4, width: "100%" }}
                  inputRef={step10Ref}
                  onKeyPress={(event) => {
                    if (event.key === "Enter") {
                      step11Ref.current.focus();
                    }
                  }}
                />
              </Grid>
              <Grid item xs={6} sm={4}>
                <FormControl
                  margin="dense"
                  variant="outlined"
                  className="w-100"
                >
                  <InputLabel id="default_yn">
                    {t("partner.supplier.default_yn")}
                  </InputLabel>
                  <Select
                    labelId="default_yn"
                    id="default_yn-select"
                    value={Supplier.default_yn || "Y"}
                    onChange={handleChange}
                    label={t("partner.supplier.default_yn")}
                    name="default_yn"
                  >
                    <MenuItem value="Y">{t("yes")}</MenuItem>
                    <MenuItem value="N">{t("no")}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Grid container spacing={1}>
              <Grid item xs={6} sm={3}>
                <TextField
                  disabled={Supplier.vender_tp === "1"}
                  fullWidth={true}
                  margin="dense"
                  autoComplete="off"
                  label={t("partner.supplier.agent_nm")}
                  onChange={handleChange}
                  value={Supplier.agent_nm || ""}
                  name="agent_nm"
                  variant="outlined"
                  inputRef={step11Ref}
                  onKeyPress={(event) => {
                    if (event.key === "Enter") {
                      step12Ref.current.focus();
                    }
                  }}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  disabled={Supplier.vender_tp === "1"}
                  fullWidth={true}
                  margin="dense"
                  autoComplete="off"
                  label={t("partner.supplier.agent_fun")}
                  onChange={handleChange}
                  value={Supplier.agent_fun || ""}
                  name="agent_fun"
                  variant="outlined"
                  inputRef={step12Ref}
                  onKeyPress={(event) => {
                    if (event.key === "Enter") {
                      step13Ref.current.focus();
                    }
                  }}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  disabled={Supplier.vender_tp === "1"}
                  fullWidth={true}
                  margin="dense"
                  autoComplete="off"
                  label={t("partner.supplier.agent_phone")}
                  onChange={handleChange}
                  value={Supplier.agent_phone || ""}
                  name="agent_phone"
                  variant="outlined"
                  inputRef={step3Ref}
                  onKeyPress={(event) => {
                    if (event.key === "Enter") {
                      step14Ref.current.focus();
                    }
                  }}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  disabled={Supplier.vender_tp === "1"}
                  fullWidth={true}
                  margin="dense"
                  autoComplete="off"
                  label={t("partner.supplier.agent_email")}
                  onChange={handleChange}
                  value={Supplier.agent_email || ""}
                  name="agent_email"
                  variant="outlined"
                  inputRef={step14Ref}
                  onKeyPress={(event) => {
                    if (event.key === "Enter") {
                      step15Ref.current.focus();
                    }
                  }}
                />
              </Grid>
            </Grid>
            <Grid container spacing={1}>
              <Grid item xs={12} sm={12}>
                <TextField
                  disabled={Supplier.agent_nm === "1"}
                  fullWidth={true}
                  margin="dense"
                  multiline
                  rows={2}
                  autoComplete="off"
                  label={t("partner.supplier.agent_address")}
                  onChange={handleChange}
                  value={Supplier.agent_address || ""}
                  name="agent_address"
                  variant="outlined"
                  inputRef={step15Ref}
                  onKeyPress={(event) => {
                    if (event.key === "Enter") {
                      handleCreate();
                    }
                  }}
                />
              </Grid>
            </Grid>
          </CardContent>
          <CardActions
            className="align-items-end"
            style={{ justifyContent: "flex-end" }}
          >
            <Button
              size="small"
              onClick={(e) => {
                if (
                  controlTimeOutKey &&
                  control_sv.ControlTimeOutObj[controlTimeOutKey]
                ) {
                  return;
                }
                setShouldOpenModal(false);
                setSupplier({ ...defaultModalAdd });
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
              {t("save_continue")} (F4)
            </Button>
          </CardActions>
        </Card>
      </Dialog>
    </>
  );
};

export default SupplierAdd;
