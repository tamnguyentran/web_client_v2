import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Grid,
  Tooltip,
  Table,
  TableBody,
  TableContainer,
  TableCell,
  TableHead,
  TableRow,
  Button,
  TextField,
  Card,
  CardHeader,
  CardContent,
  Dialog,
  CardActions,
  Divider,
} from "@material-ui/core";
import DateFnsUtils from "@date-io/date-fns";
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from "@material-ui/pickers";
import NumberFormat from "react-number-format";
import IconButton from "@material-ui/core/IconButton";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import SaveIcon from "@material-ui/icons/Save";
import CheckIcon from "@material-ui/icons/Check";
import DeleteIcon from "@material-ui/icons/Delete";
import CancelOutlinedIcon from "@material-ui/icons/CancelOutlined";
import EditIcon from "@material-ui/icons/Edit";
import LoopIcon from "@material-ui/icons/Loop";

import glb_sv from "../../../../utils/service/global_service";
import control_sv from "../../../../utils/service/control_services";
import SnackBarService from "../../../../utils/service/snackbar_service";
import reqFunction from "../../../../utils/constan/functions";
import sendRequest from "../../../../utils/service/sendReq";

import {
  tableListAddColumn,
  invoiceExportDestroyModal,
} from "../Modal/ExportDestroy.modal";
import moment from "moment";
import AddProduct from "../AddProductClone";

import EditProductRows from "../EditExportDestroy/EditProductRows";
import { useHotkeys } from "react-hotkeys-hook";
import { useReactToPrint } from "react-to-print";
import Export_Destroy_Bill from "../../../../components/Bill/Export_Destroy_Bill";
import ExportExcel from "../../../../components/ExportExcel";

const serviceInfo = {
  GET_INVOICE_BY_ID: {
    functionName: "get_by_id",
    reqFunct: reqFunction.EXPORT_DESTROY_BY_ID,
    biz: "export",
    object: "exp_destroy",
  },
  CREATE_INVOICE: {
    functionName: "insert",
    reqFunct: reqFunction.EXPORT_DESTROY_CREATE,
    biz: "export",
    object: "exp_destroy",
  },
  UPDATE_INVOICE: {
    functionName: "update",
    reqFunct: reqFunction.EXPORT_DESTROY_UPDATE,
    biz: "export",
    object: "exp_destroy",
  },
  GET_ALL_PRODUCT_BY_EXPORT_DESTROY_ID: {
    functionName: "get_all",
    reqFunct: reqFunction.GET_ALL_PRODUCT_BY_EXPORT_DESTROY_ID,
    biz: "export",
    object: "exp_destroy_dt",
  },
  ADD_PRODUCT_TO_INVOICE: {
    functionName: "insert",
    reqFunct: reqFunction.PRODUCT_EXPORT_DESTROY_INVOICE_CREATE,
    biz: "export",
    object: "exp_destroy_dt",
  },
  DELETE_PRODUCT_TO_INVOICE: {
    functionName: "delete",
    reqFunct: reqFunction.PRODUCT_EXPORT_DESTROY_INVOICE_DELETE,
    biz: "export",
    object: "exp_destroy_dt",
  },
};

const InsExportDestroy = ({}) => {
  const { t } = useTranslation();
  const [ExportDestroy, setExportDestroy] = useState({
    ...invoiceExportDestroyModal,
  });
  const [dataSource, setDataSource] = useState([]);
  const [productEditID, setProductEditID] = useState(-1);
  const [column, setColumn] = useState([...tableListAddColumn]);
  const [paymentInfo, setPaymentInfo] = useState({});
  const [productDeleteModal, setProductDeleteModal] = useState({});
  const [productDeleteIndex, setProductDeleteIndex] = useState(null);
  const [shouldOpenDeleteModal, setShouldOpenDeleteModal] = useState(false);
  const [resetFormAddFlag, setResetFormAddFlag] = useState(false);
  const [deleteProcess, setDeleteProcess] = useState(false);
  const [updateProcess, setUpdateProcess] = useState(false);
  const [invoiceFlag, setInvoiceFlag] = useState(false);

  const componentPrint = useRef(null);
  const dataWaitAdd = useRef([]);
  const newInvoiceId = useRef(-1);
  const dataSourceRef = useRef([]);
  const step1Ref = useRef(null);
  const step2Ref = useRef(null);

  useHotkeys("f6", () => handleUpdateInvoice(), {
    enableOnTags: ["INPUT", "SELECT", "TEXTAREA"],
  });

  useEffect(() => {
    const newData = { ...paymentInfo };
    newData["invoice_needpay"] =
      dataSource.reduce(function (acc, obj) {
        return acc + Math.round(obj.o_6 * obj.o_9);
      }, 0) || 0;
    setExportDestroy((prevState) => {
      return { ...prevState, ...{ payment_amount: newData.invoice_needpay } };
    });
    setPaymentInfo(newData);
  }, [dataSource]);

  const handleAddProduct = (productObject) => {
    if (!ExportDestroy.exp_dt) {
      SnackBarService.alert(
        t("message.requireExportDestroyInvoice"),
        true,
        4,
        3000
      );
      return;
    } else if (!invoiceFlag) {
      dataWaitAdd.current.push(productObject);
      handleCreateInvoice();
      return;
    } else {
      const inputParam = [
        newInvoiceId.current,
        productObject.prod_id,
        productObject.lot_no,
        productObject.qty,
        productObject.unit_id,
        productObject.price,
        productObject.reason_tp,
      ];
      sendRequest(
        serviceInfo.ADD_PRODUCT_TO_INVOICE,
        inputParam,
        handleResultAddProductToInvoice,
        true,
        handleTimeOut
      );
    }
    let newDataSource = [...dataSource];
    newDataSource.push(productObject);
    dataSourceRef.current = newDataSource;
    setDataSource(newDataSource);
  };

  const onRemove = (item) => {
    if (!item) {
      SnackBarService.alert(t("wrongData"), true, "error", 3000);
      return;
    }
    setProductDeleteModal(!!item ? item : {});
    setShouldOpenDeleteModal(!!item ? true : false);
  };

  const handleDelete = () => {
    if (
      !productDeleteModal.o_1 ||
      (!ExportDestroy.invoice_id && !newInvoiceId.current)
    )
      return;
    setDeleteProcess(true);
    const inputParam = [
      ExportDestroy.invoice_id || newInvoiceId.current,
      productDeleteModal.o_1,
    ];
    sendRequest(
      serviceInfo.DELETE_PRODUCT_TO_INVOICE,
      inputParam,
      handleResultDeleteProduct,
      true,
      (e) => {
        handleTimeOut(e);
        setDeleteProcess(false);
      }
    );
  };

  const handleResultDeleteProduct = (reqInfoMap, message) => {
    SnackBarService.alert(
      message["PROC_MESSAGE"],
      true,
      message["PROC_STATUS"],
      3000
    );
    setDeleteProcess(false);
    if (message["PROC_STATUS"] !== 1) {
      // xử lý thất bại
      const cltSeqResult = message["REQUEST_SEQ"];
      glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap);
      control_sv.clearReqInfoMapRequest(cltSeqResult);
    } else if (message["PROC_DATA"]) {
      // xử lý thành công
      setProductDeleteIndex(null);
      setProductDeleteModal({});
      setShouldOpenDeleteModal(false);
      handleRefresh();
    }
  };

  const handleCreateInvoice = () => {
    if (!ExportDestroy.exp_dt) {
      SnackBarService.alert(
        t("message.requireExportDestroyInvoice"),
        true,
        4,
        3000
      );
      return;
    }
    //bắn event tạo invoice
    const inputParam = [
      moment(ExportDestroy.exp_dt).format("YYYYMMDD"),
      ExportDestroy.staff_exp,
      ExportDestroy.note,
    ];
    sendRequest(
      serviceInfo.CREATE_INVOICE,
      inputParam,
      handleResultCreateInvoice,
      true,
      handleTimeOut
    );
  };

  const handleResultCreateInvoice = (reqInfoMap, message) => {
    SnackBarService.alert(
      message["PROC_MESSAGE"],
      true,
      message["PROC_STATUS"],
      3000
    );
    if (message["PROC_STATUS"] !== 1) {
      // xử lý thất bại
      const cltSeqResult = message["REQUEST_SEQ"];
      glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap);
      control_sv.clearReqInfoMapRequest(cltSeqResult);
    } else if (message["PROC_DATA"]) {
      // xử lý thành công
      let newData = message["PROC_DATA"];
      if (!!newData.rows[0].o_1) {
        newInvoiceId.current = newData.rows[0].o_1;
        setInvoiceFlag(true);
        sendRequest(
          serviceInfo.GET_INVOICE_BY_ID,
          [newInvoiceId.current],
          handleResultGetInvoiceByID,
          true,
          handleTimeOut
        );
        if (dataWaitAdd.current.length > 0) {
          for (let i = 0; i < dataWaitAdd.current.length; i++) {
            const item = dataWaitAdd.current[i];
            const inputParam = [
              newData.rows[0].o_1 || newInvoiceId.current,
              item.prod_id,
              item.lot_no,
              item.qty,
              item.unit_id,
              item.price,
              item.reason_tp,
            ];
            sendRequest(
              serviceInfo.ADD_PRODUCT_TO_INVOICE,
              inputParam,
              handleResultAddProductToInvoice,
              true,
              handleTimeOut
            );
          }
        }
      }
    }
  };

  const handleResultAddProductToInvoice = (reqInfoMap, message) => {
    SnackBarService.alert(
      message["PROC_MESSAGE"],
      true,
      message["PROC_STATUS"],
      3000
    );
    if (message["PROC_STATUS"] !== 1) {
      // xử lý thất bại
      const cltSeqResult = message["REQUEST_SEQ"];
      glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap);
      control_sv.clearReqInfoMapRequest(cltSeqResult);
    } else if (message["PROC_DATA"]) {
      // xử lý thành công
      dataWaitAdd.current = [];
      setResetFormAddFlag(true);
      setTimeout(() => {
        setResetFormAddFlag(false);
      }, 1000);
      handleRefresh();
    }
  };

  const handleResultGetInvoiceByID = (reqInfoMap, message) => {
    // SnackBarService.alert(message['PROC_MESSAGE'], true, message['PROC_STATUS'], 3000)
    if (message["PROC_STATUS"] !== 1) {
      // xử lý thất bại
      const cltSeqResult = message["REQUEST_SEQ"];
      glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap);
      control_sv.clearReqInfoMapRequest(cltSeqResult);
    } else if (message["PROC_DATA"]) {
      // xử lý thành công
      let newData = message["PROC_DATA"];
      newInvoiceId.current = newData.rows[0].o_1;
      let dataExportDestroy = {
        invoice_id: newData.rows[0].o_1,
        invoice_no: newData.rows[0].o_2,
        invoice_stat: newData.rows[0].o_3,
        exp_dt: moment(newData.rows[0].o_4, "YYYYMMDD").toString(),
        input_dt: moment(newData.rows[0].o_5, "YYYYMMDD").toString(),
        staff_exp: newData.rows[0].o_6,
        cancel_reason: newData.rows[0].o_7,
        note: newData.rows[0].o_7,
        invoice_val: newData.rows[0].o_9,
      };
      setExportDestroy(dataExportDestroy);
    }
  };

  const handleGetAllProductByInvoiceID = (reqInfoMap, message) => {
    if (message["PROC_STATUS"] !== 1) {
      // xử lý thất bại
      const cltSeqResult = message["REQUEST_SEQ"];
      glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap);
      control_sv.clearReqInfoMapRequest(cltSeqResult);
    } else if (message["PROC_DATA"]) {
      // xử lý thành công
      let newData = message["PROC_DATA"];
      setDataSource(newData.rows);
    }
  };

  const handleUpdateInvoice = () => {
    if (!ExportDestroy.invoice_id && !invoiceFlag) {
      handleCreateInvoice();
      // SnackBarService.alert(t('can_not_found_id_invoice_please_try_again'), true, 'error', 3000)
      return;
    } else if (!ExportDestroy.exp_dt) {
      SnackBarService.alert(
        t("message.requireExportDestroyInvoice"),
        true,
        "error",
        3000
      );
      return;
    }
    setUpdateProcess(true);
    //bắn event update invoice
    const inputParam = [
      ExportDestroy.invoice_id,
      moment(ExportDestroy.exp_dt).format("YYYYMMDD"),
      ExportDestroy.staff_exp,
      ExportDestroy.note,
    ];
    sendRequest(
      serviceInfo.UPDATE_INVOICE,
      inputParam,
      handleResultUpdateInvoice,
      true,
      (e) => {
        handleTimeOut(e);
        setUpdateProcess(false);
      }
    );
  };

  const handleResultUpdateInvoice = (reqInfoMap, message) => {
    SnackBarService.alert(
      message["PROC_MESSAGE"],
      true,
      message["PROC_STATUS"],
      3000
    );
    setUpdateProcess(false);
    if (message["PROC_STATUS"] !== 1) {
      // xử lý thất bại
      const cltSeqResult = message["REQUEST_SEQ"];
      glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap);
      control_sv.clearReqInfoMapRequest(cltSeqResult);
    } else if (message["PROC_DATA"]) {
      // xử lý thành công
      sendRequest(
        serviceInfo.GET_INVOICE_BY_ID,
        [newInvoiceId.current],
        handleResultGetInvoiceByID,
        true,
        handleTimeOut
      );
    }
  };

  const handleRefresh = () => {
    sendRequest(
      serviceInfo.GET_ALL_PRODUCT_BY_EXPORT_DESTROY_ID,
      [newInvoiceId.current],
      handleGetAllProductByInvoiceID,
      true,
      handleTimeOut
    );
    sendRequest(
      serviceInfo.GET_INVOICE_BY_ID,
      [newInvoiceId.current],
      handleResultGetInvoiceByID,
      true,
      handleTimeOut
    );
  };

  //-- xử lý khi timeout -> ko nhận được phản hồi từ server
  const handleTimeOut = (e) => {
    SnackBarService.alert(t(`message.${e.type}`), true, 4, 3000);
  };

  const handleDateChange = (date) => {
    const newExportDestroy = { ...ExportDestroy };
    newExportDestroy["exp_dt"] = date;
    setExportDestroy(newExportDestroy);
  };

  const handleChange = (e) => {
    const newExportDestroy = { ...ExportDestroy };
    newExportDestroy[e.target.name] = e.target.value;
    setExportDestroy(newExportDestroy);
  };

  const handleAmountChange = (value) => {
    const newExportDestroy = { ...ExportDestroy };
    newExportDestroy["payment_amount"] = Number(value.value);
    setExportDestroy(newExportDestroy);
  };

  const checkValidate = () => {
    if (invoiceFlag && !!ExportDestroy.exp_dt) {
      return false;
    }
    return true;
  };

  const onDoubleClickRow = (rowData) => {
    if (!rowData) {
      SnackBarService.alert(t("wrongData"), true, "error", 3000);
      return;
    }
    setProductEditID(rowData.o_1);
  };

  const headersCSV = [
    { label: t("stt"), key: "stt" },
    { label: t("order.export.prod_nm"), key: "prod_nm" },
    { label: t("order.export.lot_no"), key: "lot_no" },
    { label: t("order.export.qty"), key: "qty" },
    { label: t("order.export.unit_nm"), key: "unit_nm" },
    { label: t("order.export.price"), key: "price" },
    { label: t("order.export.cancel_reason"), key: "cancel_reason" },
    { label: t(""), key: "space_01" },
    { label: t("order.export.invoice_no"), key: "invoice_no" },
    { label: t("order.export.exp_dt"), key: "exp_dt" },
    { label: t("order.export.note"), key: "note" },
    { label: t("order.export.invoice_val"), key: "invoice_val" },
  ];

  const dataCSV = () => {
    let result = dataSource.map((item, index) => {
      const data = item;
      item = {};
      item["stt"] = index + 1;
      item["prod_nm"] = data.o_5;
      item["lot_no"] = data.o_6;
      item["qty"] = data.o_7;
      item["unit_nm"] = data.o_9;
      item["price"] = data.o_10;
      item["cancel_reason"] = data.o_12;

      item["space_01"] = "";
      item["invoice_no"] = ExportDestroy.invoice_no;
      item["exp_dt"] = ExportDestroy.exp_dt
        ? moment(ExportDestroy.exp_dt).format("DD/MM/YYYY")
        : "";
      item["invoice_val"] = ExportDestroy.invoice_val;
      item["note"] = ExportDestroy.note;
      return item;
    });
    return result;
  };

  const handlePrint = useReactToPrint({
    content: () => componentPrint.current,
  });

  return (
    <Grid container spacing={1}>
      <EditProductRows
        productEditID={productEditID}
        invoiceID={newInvoiceId.current}
        onRefresh={handleRefresh}
        setProductEditID={setProductEditID}
      />
      <Grid item md={9} xs={12}>
        <AddProduct
          resetFlag={resetFormAddFlag}
          onAddProduct={handleAddProduct}
        />
        <Card>
          <CardHeader
            title={t("order.exportDestroy.productExportDestroyList")}
            action={
              <ExportExcel
                filename={`export_destroy_${ExportDestroy.invoice_no}`}
                data={dataCSV()}
                headers={headersCSV}
                style={{ backgroundColor: "#00A248", color: "#fff" }}
              />
            }
          />
          <CardContent>
            <TableContainer className="height-table-260 tableContainer tableOrder">
              <Table stickyHeader>
                <caption
                  className={[
                    "text-center text-danger border-bottom",
                    dataSource.length > 0 ? "d-none" : "",
                  ].join(" ")}
                >
                  {t("lbl.emptyData")}
                </caption>
                <TableHead>
                  <TableRow>
                    {column.map((col) => (
                      <TableCell
                        nowrap="true"
                        align={col.align}
                        className={[
                          "p-2 border-0",
                          col.show ? "d-table-cell" : "d-none",
                        ].join(" ")}
                        key={col.field}
                      >
                        {t(col.title)}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dataSource.map((item, index) => {
                    return (
                      <TableRow
                        onDoubleClick={(e) => {
                          onDoubleClickRow(item);
                        }}
                        hover
                        role="checkbox"
                        tabIndex={-1}
                        key={index}
                      >
                        {column.map((col, indexRow) => {
                          let value = item[col.field];
                          if (col.show) {
                            switch (col.field) {
                              case "stt":
                                return (
                                  <TableCell
                                    nowrap="true"
                                    key={indexRow}
                                    align={col.align}
                                  >
                                    {index + 1}
                                  </TableCell>
                                );
                              case "action":
                                return (
                                  <TableCell
                                    nowrap="true"
                                    key={indexRow}
                                    align={col.align}
                                  >
                                    <IconButton
                                      onClick={(e) => {
                                        onRemove(index);
                                        setProductDeleteIndex(index + 1);
                                      }}
                                    >
                                      <DeleteIcon
                                        style={{ color: "red" }}
                                        fontSize="small"
                                      />
                                    </IconButton>
                                    <IconButton
                                      onClick={(e) => {
                                        onDoubleClickRow(item);
                                      }}
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                  </TableCell>
                                );
                              case "stt":
                                return (
                                  <TableCell
                                    nowrap="true"
                                    key={indexRow}
                                    align={col.align}
                                  >
                                    {index + 1}
                                  </TableCell>
                                );
                              case "reason_tp":
                                return (
                                  <TableCell
                                    nowrap="true"
                                    key={indexRow}
                                    align={col.align}
                                  >
                                    {value === "1"
                                      ? t(
                                          "order.exportDestroy.cancel_by_out_of_date"
                                        )
                                      : value === "2"
                                      ? t(
                                          "order.exportDestroy.cancel_by_lost_goods"
                                        )
                                      : value === "3"
                                      ? t(
                                          "order.exportDestroy.cancel_by_inventory_balance"
                                        )
                                      : t("other_reason")}
                                  </TableCell>
                                );
                              default:
                                return (
                                  <TableCell
                                    nowrap="true"
                                    key={indexRow}
                                    align={col.align}
                                  >
                                    {glb_sv.formatValue(value, col["type"])}
                                  </TableCell>
                                );
                            }
                          }
                        })}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
      <Grid item md={3} xs={12}>
        <Card>
          <CardHeader title={t("order.exportDestroy.invoice_info")} />
          <CardContent>
            <Grid container spacing={1}>
              <TextField
                fullWidth={true}
                margin="dense"
                autoComplete="off"
                label={t("order.exportDestroy.invoice_no")}
                disabled={true}
                value={ExportDestroy.invoice_no || ""}
                name="invoice_no"
                variant="outlined"
              />
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <KeyboardDatePicker
                  disableToolbar
                  margin="dense"
                  variant="outlined"
                  style={{ width: "100%" }}
                  inputVariant="outlined"
                  format="dd/MM/yyyy"
                  id="exp_dt-picker-inline"
                  label={t("order.exportDestroy.exp_dt")}
                  value={ExportDestroy.exp_dt}
                  onChange={handleDateChange}
                  KeyboardButtonProps={{
                    "aria-label": "change date",
                  }}
                  inputRef={step1Ref}
                  onKeyPress={(event) => {
                    if (event.key === "Enter") {
                      step2Ref.current.focus();
                    }
                  }}
                />
              </MuiPickersUtilsProvider>
              <TextField
                fullWidth={true}
                margin="dense"
                multiline
                autoComplete="off"
                rows={2}
                rowsMax={5}
                label={t("order.exportDestroy.note")}
                onChange={handleChange}
                value={ExportDestroy.note || ""}
                name="note"
                variant="outlined"
                inputRef={step2Ref}
                onKeyPress={(event) => {
                  if (event.key === "Enter") {
                    handleUpdateInvoice();
                  }
                }}
              />
              <NumberFormat
                className="inputNumber"
                style={{ width: "100%" }}
                value={ExportDestroy.invoice_val || 0}
                label={t("order.exportDestroy.invoice_val")}
                customInput={TextField}
                autoComplete="off"
                margin="dense"
                type="text"
                variant="outlined"
                thousandSeparator={true}
                disabled={true}
              />
              <NumberFormat
                className="inputNumber"
                style={{ width: "100%" }}
                required
                value={ExportDestroy.payment_amount}
                label={t("settlement.payment_amount")}
                onValueChange={handleAmountChange}
                name="payment_amount"
                customInput={TextField}
                autoComplete="off"
                margin="dense"
                type="text"
                variant="outlined"
                thousandSeparator={true}
              />
              <Divider orientation="horizontal" flexItem />
              <NumberFormat
                className="inputNumber"
                style={{ width: "100%" }}
                value={
                  ExportDestroy.payment_amount - paymentInfo.invoice_needpay > 0
                    ? ExportDestroy.payment_amount - paymentInfo.invoice_needpay
                    : 0
                }
                label={t("settlement.excess_cash")}
                customInput={TextField}
                autoComplete="off"
                margin="dense"
                type="text"
                variant="outlined"
                thousandSeparator={true}
                disabled={true}
              />
              {/* <TextField
                                fullWidth={true}
                                margin="dense"
                                multiline
                                rows={1}
                                autoComplete="off"
                                label={t('order.exportDestroy.staff_exp')}
                                onChange={handleChange}
                                value={ExportDestroy.staff_exp || ''}
                                name='staff_exp'
                                variant="outlined"
                            /> */}
            </Grid>
            <Grid container spacing={1} className="mt-2">
              <Button
                size="small"
                style={{ width: "calc(60% - 0.25rem)", marginRight: "0.5rem" }}
                onClick={() => {
                  handleUpdateInvoice();
                }}
                variant="contained"
                disabled={checkValidate()}
                className={
                  checkValidate() === false
                    ? updateProcess
                      ? "button-loading bg-success text-white"
                      : "bg-success text-white"
                    : ""
                }
                endIcon={updateProcess && <LoopIcon />}
              >
                {t("btn.payment")}
              </Button>
              <Button
                onClick={handlePrint}
                disabled={!invoiceFlag}
                className={invoiceFlag ? "bg-print text-white" : ""}
                id="buttonPrint"
                size="smail"
                variant="contained"
                style={{ width: "calc(40% - 0.25rem)" }}
              >
                {t("print")}
              </Button>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      <div className="" style={{ display: "none" }}>
        <Export_Destroy_Bill
          headerModal={ExportDestroy}
          detailModal={dataSource}
          componentRef={componentPrint}
        />
      </div>

      {/* modal delete */}
      <Dialog
        maxWidth="xs"
        fullWidth={true}
        TransitionProps={{
          addEndListener: (node, done) => {
            // use the css transitionend event to mark the finish of a transition
            node.addEventListener("keypress", function (e) {
              if (e.key === "Enter") {
                handleDelete();
              }
            });
          },
        }}
        open={shouldOpenDeleteModal}
        onClose={(e) => {
          setShouldOpenDeleteModal(false);
        }}
      >
        <Card>
          <CardHeader title={t("order.export.productDelete")} />
          <CardContent>
            <Grid container>
              {productDeleteModal.o_4 +
                " - " +
                t("order.export.qty") +
                ": " +
                productDeleteModal.o_6 +
                " " +
                productDeleteModal.o_8 +
                " (" +
                t("stt") +
                " " +
                productDeleteIndex +
                ")"}
            </Grid>
          </CardContent>
          <CardActions
            className="align-items-end"
            style={{ justifyContent: "flex-end" }}
          >
            <Button
              size="small"
              onClick={(e) => {
                setShouldOpenDeleteModal(false);
              }}
              startIcon={<ExitToAppIcon />}
              variant="contained"
              disableElevation
            >
              {t("btn.close")} (Esc)
            </Button>
            <Button
              className={deleteProcess ? "button-loading" : ""}
              endIcon={deleteProcess && <LoopIcon />}
              size="small"
              onClick={handleDelete}
              variant="contained"
              color="secondary"
              startIcon={<DeleteIcon />}
            >
              {t("btn.delete")} (f10)
            </Button>
          </CardActions>
        </Card>
      </Dialog>
    </Grid>
  );
};

export default InsExportDestroy;
