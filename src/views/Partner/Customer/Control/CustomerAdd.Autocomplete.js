import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  TextField,
  Button,
  Dialog,
  Tooltip,
  Grid,
} from "@material-ui/core";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import SaveIcon from "@material-ui/icons/Save";
import CheckIcon from "@material-ui/icons/Check";
import DeleteIcon from "@material-ui/icons/Delete";
import Autocomplete from "@material-ui/lab/Autocomplete";
import SnackBarService from "../../../../utils/service/snackbar_service";
import sendRequest from "../../../../utils/service/sendReq";
import reqFunction from "../../../../utils/constan/functions";
import { requestInfo } from "../../../../utils/models/requestInfo";
import glb_sv from "../../../../utils/service/global_service";
import control_sv from "../../../../utils/service/control_services";
import socket_sv from "../../../../utils/service/socket_service";
import { defaultModalAdd } from "../Modal/Customer.modal";
import LoopIcon from "@material-ui/icons/Loop";

const serviceInfo = {
  DROPDOWN_LIST: {
    functionName: "drop_list",
    reqFunct: reqFunction.CUSTOMER_DROPDOWN_LIST,
    biz: "common",
    object: "dropdown_list",
  },
  CREATE_CUSTOMER: {
    functionName: "insert",
    reqFunct: reqFunction.CUSTOMER_CREATE,
    biz: "export",
    object: "customers",
  },
};

const CustomerAdd_Autocomplete = ({
  onSelect,
  onCreate,
  label,
  style,
  size,
  value,
  disabled = false,
  onKeyPress = () => null,
  inputRef = null,
  autoFocus = null,
}) => {
  const { t } = useTranslation();

  const [dataSource, setDataSource] = useState([]);
  const [valueSelect, setValueSelect] = useState({});
  const [inputValue, setInputValue] = useState("");
  const [shouldOpenModal, setShouldOpenModal] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({ ...defaultModalAdd });
  const [process, setProcess] = useState(false);
  const idCreated = useRef(-1);

  const refFocus1 = useRef(null)

  useEffect(() => {
    const inputParam = ["customers", "%"];
    sendRequest(
      serviceInfo.DROPDOWN_LIST,
      inputParam,
      null,
      true,
      handleTimeOut
    );
    const customerSub = socket_sv.event_ClientReqRcv.subscribe((msg) => {
      if (msg) {
        const cltSeqResult = msg["REQUEST_SEQ"];
        if (
          cltSeqResult == null ||
          cltSeqResult === undefined ||
          isNaN(cltSeqResult)
        ) {
          return;
        }
        const reqInfoMap = glb_sv.getReqInfoMapValue(cltSeqResult);
        if (reqInfoMap == null || reqInfoMap === undefined) {
          return;
        }
        if (reqInfoMap.reqFunct === reqFunction.CUSTOMER_DROPDOWN_LIST) {
          resultCustomerDropDownList(msg, cltSeqResult, reqInfoMap);
        }
        if (reqInfoMap.reqFunct === reqFunction.CUSTOMER_CREATE) {
          resultCreateCustomer(msg, cltSeqResult, reqInfoMap);
        }
        // if (reqInfoMap.reqFunct === reqFunction.INS_CUSTOMER) {
        //   resultCreateCustomer(msg, cltSeqResult, reqInfoMap);
        // }CUSTOMER_CREATE
      }
    });
    return () => {
      customerSub.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (value !== null || value !== undefined) {
      setValueSelect(dataSource.find((x) => x.o_2 === value));
    }
    if (idCreated.current !== -1) {
      setValueSelect(dataSource.find((x) => x.o_1 === idCreated.current));
      idCreated.current = -1;
    }
  }, [value, dataSource]);

  const resultCustomerDropDownList = (
    message = {},
    cltSeqResult = 0,
    reqInfoMap = new requestInfo()
  ) => {
    control_sv.clearTimeOutRequest(reqInfoMap.timeOutKey);
    reqInfoMap.procStat = 2;
    if (message["PROC_STATUS"] === 2) {
      reqInfoMap.resSucc = false;
      glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap);
      control_sv.clearReqInfoMapRequest(cltSeqResult);
    }
    if (message["PROC_DATA"]) {
      let newData = message["PROC_DATA"];
      setDataSource(newData.rows);
    }
  };

  const resultCreateCustomer = (
    message = {},
    cltSeqResult = 0,
    reqInfoMap = new requestInfo()
  ) => {
    control_sv.clearTimeOutRequest(reqInfoMap.timeOutKey);
    if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) {
      return;
    }
    SnackBarService.alert(
      message["PROC_MESSAGE"],
      true,
      message["PROC_STATUS"],
      3000
    );
    if (message["PROC_STATUS"] === 0) {
      reqInfoMap.resSucc = false;
      setProcess(false);
      glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap);
      refFocus1.current.focus()
    } else {
      let data = message["PROC_DATA"];
      idCreated.current = data.rows[0].o_1;
      setProcess(false);
      onCreate(data.rows[0].o_1);
      setCustomerInfo({ ...defaultModalAdd });
      setShouldOpenModal(false);
      // Lấy dữ liệu mới nhất
      const inputParam = ["customers", "%"];
      sendRequest(
        serviceInfo.DROPDOWN_LIST,
        inputParam,
        (e) => console.log("result ", e),
        true,
        handleTimeOut
      );
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
  };

  const checkValidate = () => {
    if (!!customerInfo.cust_nm_v && !!customerInfo.cust_nm_v.trim()) {
      return false;
    }
    return true;
  };

  const handleCreateCustomer = () => {
    if (!customerInfo.cust_nm_v.trim()) return;
    setProcess(true);
    const inputParam = [
      customerInfo.cust_nm_v.trim(),
      customerInfo.cust_nm_e,
      customerInfo.cust_nm_short,
      customerInfo.address,
      customerInfo.phone,
      customerInfo.fax,
      customerInfo.email,
      customerInfo.website,
      customerInfo.tax_cd,
      customerInfo.bank_acnt_no,
      customerInfo.bank_acnt_nm,
      customerInfo.bank_cd,
      customerInfo.agent_nm,
      customerInfo.agent_fun,
      customerInfo.agent_address,
      customerInfo.agent_phone,
      customerInfo.agent_email,
      customerInfo.default_yn,
      customerInfo.cust_tp,
    ];
    sendRequest(
      serviceInfo.CREATE_CUSTOMER,
      inputParam,
      null,
      true,
      handleTimeOut
    );
  };

  const handleChange = (e) => {
    let newCustomer = { ...customerInfo };
    newCustomer[e.target.name] = e.target.value;
    setCustomerInfo(newCustomer);
  };

  const closePopupAddCustomer = () => {
    setShouldOpenModal(false);
    setCustomerInfo({ ...defaultModalAdd });
  };
  return (
    <>
      <Autocomplete
        disableClearable
        disabled={disabled}
        onChange={onChange}
        onInputChange={handleChangeInput}
        onKeyPress={onKeyPress}
        size={!!size ? size : "small"}
        id="combo-box-demo"
        options={dataSource}
        value={valueSelect}
        // autoSelect={true}
        autoHighlight={true}
        autoComplete={true}
        getOptionLabel={(option) => option.o_2 || ""}
        // style={{ marginTop: 8, marginBottom: 4, width: !disabled ? '80%' : '100%' }}
        // renderInput={(params) => <TextField {...params} label={!!label ? label : ''} variant="outlined" />}
        style={{ marginTop: 8, marginBottom: 4, width: "100%" }}
        renderInput={(params) => {
          let newParams = {
            ...params,
            ...{
              InputProps: {
                ...params.InputProps,
                // endAdornment: Object.assign(params.InputProps.endAdornment, (
                //     <Tooltip title={t('partner.customer.titleAdd')} aria-label="add">
                //         <AddCircleIcon style={{ color: 'green' }} onClick={() => setShouldOpenModal(true)} />
                //     </Tooltip>
                // )),
                startAdornment: (
                  <Tooltip
                    title={t("partner.customer.titleQuickAdd")}
                    aria-label="add"
                  >
                    <AddCircleIcon
                      className="cursor-pointer"
                      style={{ color: "green" }}
                      onClick={() => setShouldOpenModal(true)}
                    />
                  </Tooltip>
                ),
              },
            },
          };
          return (
            <TextField
              {...newParams}
              inputRef={inputRef}
              autoFocus={autoFocus}
              label={!!label ? label : ""}
              variant="outlined"
            />
          );
        }}
      />
      {/* {!disabled &&
                <Tooltip title={t('partner.customer.titleAdd')} aria-label="add">
                    <AddCircleIcon style={{ width: '20%', color: 'green' }} onClick={() => setShouldOpenModal(true)} />
                </Tooltip>
            } */}

      <Dialog
        fullWidth={true}
        maxWidth="sm"
        open={shouldOpenModal}
        onClose={closePopupAddCustomer}
      >
        <Card>
          <CardHeader title={t("partner.customer.titleQuickAdd")} />
          <CardContent>
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <TextField
                  fullWidth={true}
                  margin="dense"
                  required={true}
                  className="uppercaseInput"
                  autoComplete="off"
                  label={t("partner.customer.cust_nm_v")}
                  onChange={handleChange}
                  value={customerInfo.cust_nm_v || ""}
                  name="cust_nm_v"
                  variant="outlined"
                  inputRef = {refFocus1}
                  autoFocus = {true}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth={true}
                  margin="dense"
                  autoComplete="off"
                  label={t("partner.customer.phone")}
                  onChange={handleChange}
                  value={customerInfo.phone || ""}
                  name="phone"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth={true}
                  // margin="dense"
                  autoComplete="off"
                  label={t("partner.customer.address")}
                  onChange={handleChange}
                  value={customerInfo.address || ""}
                  name="address"
                  variant="outlined"
                />
              </Grid>
            </Grid>
            <note style={{ color: "var(--danger)" }}>
              {t("partner.customer.titleQuickAddGuidles")}
            </note>
          </CardContent>
          <CardActions
            className="align-items-end"
            style={{ justifyContent: "flex-end" }}
          >
            <Button
              size="small"
              onClick={(e) => {
                setShouldOpenModal(false);
                setCustomerInfo({ ...defaultModalAdd });
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
                handleCreateCustomer();
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
          </CardActions>
        </Card>
      </Dialog>
    </>
  );
};

export default CustomerAdd_Autocomplete;
