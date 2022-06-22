import React, { useState, useRef, useEffect } from "react";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { useHotkeys } from "react-hotkeys-hook";
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
  Divider,
  Dialog,
  CardActions,
  FormControlLabel,
  Checkbox,
} from "@material-ui/core";
import DateFnsUtils from "@date-io/date-fns";
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from "@material-ui/pickers";
import NumberFormat from "react-number-format";
import IconButton from "@material-ui/core/IconButton";
import CancelOutlinedIcon from "@material-ui/icons/CancelOutlined";
import EditIcon from "@material-ui/icons/Edit";
import LoopIcon from "@material-ui/icons/Loop";
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";

import glb_sv from "../../../../utils/service/global_service";
import control_sv from "../../../../utils/service/control_services";
import SnackBarService from "../../../../utils/service/snackbar_service";
import reqFunction from "../../../../utils/constan/functions";
import sendRequest from "../../../../utils/service/sendReq";

import { tableListAddColumn, invoiceExportModal } from "../Modal/Export.modal";

import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import SaveIcon from "@material-ui/icons/Save";
import CheckIcon from "@material-ui/icons/Check";
import DeleteIcon from "@material-ui/icons/Delete";
import AddProduct from "../AddProductClone";
import EditProductRows from "../EditExport/EditProductRows";
import CustomerAdd_Autocomplete from "../../../Partner/Customer/Control/CustomerAdd.Autocomplete";
import { useReactToPrint } from "react-to-print";
import Export_Bill from "../../../../components/Bill/Export_Bill";
import ExportExcel from "../../../../components/ExportExcel";

const serviceInfo = {
  GET_INVOICE_BY_ID: {
    functionName: "get_by_id",
    reqFunct: reqFunction.EXPORT_BY_ID,
    biz: "export",
    object: "exp_invoices",
  },
  CREATE_INVOICE: {
    functionName: "insert",
    reqFunct: reqFunction.EXPORT_CREATE,
    biz: "export",
    object: "exp_invoices",
  },
  UPDATE_INVOICE: {
    functionName: "update",
    reqFunct: reqFunction.EXPORT_UPDATE,
    biz: "export",
    object: "exp_invoices",
  },
  GET_ALL_PRODUCT_BY_EXPORT_ID: {
    functionName: "get_all",
    reqFunct: reqFunction.GET_ALL_PRODUCT_BY_EXPORT_ID,
    biz: "export",
    object: "exp_invoices_dt",
  },
  ADD_PRODUCT_TO_INVOICE: {
    functionName: "insert",
    reqFunct: reqFunction.PRODUCT_EXPORT_INVOICE_CREATE,
    biz: "export",
    object: "exp_invoices_dt",
  },
  UPDATE_PRODUCT_TO_INVOICE: {
    functionName: "update",
    reqFunct: reqFunction.PRODUCT_EXPORT_INVOICE_UPDATE,
    biz: "export",
    object: "exp_invoices_dt",
  },
  DELETE_PRODUCT_TO_INVOICE: {
    functionName: "delete",
    reqFunct: reqFunction.PRODUCT_EXPORT_INVOICE_DELETE,
    biz: "export",
    object: "exp_invoices_dt",
  },
};

const InsExport = ({}) => {
  const { t } = useTranslation();
  const [Export, setExport] = useState({ ...invoiceExportModal });
  const [customerSelect, setCustomerSelect] = useState("");
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
  const [invoiceType, setInvoiceType] = useState(true);

  const componentPrint = useRef(null);
  const dataWaitAdd = useRef([]);
  const newInvoiceId = useRef(-1);
  const step1Ref = useRef(null);
  const step2Ref = useRef(null);
  const step3Ref = useRef(null);

  useHotkeys("f6", () => handleCreateInvoice(), {
    enableOnTags: ["INPUT", "SELECT", "TEXTAREA"],
  });

  useEffect(() => {
    const newData = { ...paymentInfo };
    newData["invoice_val"] =
      dataSource.reduce(function (acc, obj) {
        return acc + Math.round(obj.o_7 * obj.o_10);
      }, 0) || 0;
    newData["invoice_discount"] =
      dataSource.reduce(function (acc, obj) {
        return acc + Math.round((obj.o_11 / 100) * newData.invoice_val);
      }, 0) || 0;
    newData["invoice_vat"] =
      dataSource.reduce(function (acc, obj) {
        return (
          acc +
          Math.round(
            (obj.o_12 / 100) *
              Math.round(newData.invoice_val * (1 - obj.o_11 / 100))
          )
        );
      }, 0) || 0;
    newData["invoice_needpay"] =
      newData.invoice_val - newData.invoice_discount + newData.invoice_vat || 0;
    setExport((prevState) => {
      return { ...prevState, ...{ payment_amount: newData.invoice_needpay } };
    });
    setPaymentInfo(newData);
  }, [dataSource]);

  //-- xử lý khi timeout -> ko nhận được phản hồi từ server
  const handleTimeOut = (e) => {
    SnackBarService.alert(t(`message.${e.type}`), true, 4, 3000);
  };

  const handleSelectCustomer = (obj) => {
    const newExport = { ...Export };
    newExport["customer"] = !!obj ? obj?.o_1 : null;
    setCustomerSelect(!!obj ? obj?.o_2 : "");
    setExport(newExport);
  };

  const handleDateChange = (date) => {
    const newExport = { ...Export };
    newExport["order_dt"] = date;
    setExport(newExport);
  };

  const handleChange = (e) => {
    const newExport = { ...Export };
    newExport[e.target.name] = e.target.value;
    setExport(newExport);
  };

  const handleAmountChange = (value) => {
    const newExport = { ...Export };
    newExport["payment_amount"] = Number(value.value);
    setExport(newExport);
  };

  const handleAddProduct = (productObject) => {
    console.log("hhhhhhhhh");
    if (!Export.customer || !Export.order_dt) {
      console.log("hhhhhhhhh1");
      SnackBarService.alert(t("message.requireExportInvoice"), true, 4, 3000);
      return;
    } else if (!invoiceFlag) {
      console.log("hhhhhhhhh3");
      dataWaitAdd.current.push(productObject);
      handleCreateInvoice();
      return;
    } else {
      const inputParam = [
        newInvoiceId.current,
        productObject.exp_tp,
        productObject.prod_id,
        productObject.lot_no,
        productObject.qty,
        productObject.unit_id,
        productObject.price,
        productObject.discount_per,
        productObject.vat_per,
      ];
      console.log("inputParamsvs", inputParam);
      sendRequest(
        serviceInfo.ADD_PRODUCT_TO_INVOICE,
        inputParam,
        handleResultAddProductToInvoice,
        true,
        handleTimeOut
      );
    }
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
      (!Export.invoice_id && !newInvoiceId.current)
    )
      return;
    setDeleteProcess(true);
    const inputParam = [
      Export.invoice_id || newInvoiceId.current,
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

  const checkValidate = () => {
    if (!!Export.customer && !!Export.order_dt && invoiceFlag) {
      return false;
    }
    return true;
  };

  const handleCreateInvoice = () => {
    if (!Export.customer || !Export.order_dt) {
      SnackBarService.alert(t("message.requireExportInvoice"), true, 4, 3000);
      return;
    }
    //bắn event tạo invoice
    const inputParam = [
      !!Export.invoice_no.trim() ? Export.invoice_no.trim() : "AUTO",
      Export.customer,
      moment(Export.order_dt).format("YYYYMMDD"),
      Export.staff_exp,
      Export.note,
    ];
    console.log("inputParam1234",inputParam)
    sendRequest(
      serviceInfo.CREATE_INVOICE,
      inputParam,
      handleResultCreateInvoice,
      true,
      handleTimeOut
    );
  };

  const handleResultCreateInvoice = (reqInfoMap, message) => {
      console.log(message);
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
        console.log(dataWaitAdd.current.length)
        if (dataWaitAdd.current.length > 0) {
            console.log(dataWaitAdd);
          for (let i = 0; i < dataWaitAdd.current.length; i++) {
            const item = dataWaitAdd.current[i];
            const inputParam = [
              newData.rows[0].o_1 || newInvoiceId.current,
              item.exp_tp,
              item.prod_id,
              item.lot_no,
              item.qty,
              item.unit_id,
              item.price,
              item.discount_per,
              item.vat_per,
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
      console.log(reqInfoMap)
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
      let dataExport = {
        invoice_id: newData.rows[0].o_1,
        invoice_no: newData.rows[0].o_2,
        invoice_stat: newData.rows[0].o_3,
        customer_id: newData.rows[0].o_4,
        customer: newData.rows[0].o_5,
        order_dt: moment(newData.rows[0].o_6, "YYYYMMDD").toString(),
        input_dt: moment(newData.rows[0].o_7, "YYYYMMDD").toString(),
        staff_exp: newData.rows[0].o_8,
        cancel_reason: newData.rows[0].o_9,
        note: newData.rows[0].o_10,
        invoice_val: newData.rows[0].o_12,
        invoice_discount: newData.rows[0].o_13,
        invoice_vat: newData.rows[0].o_14,
      };

      console.log(dataExport) // list hóa đơn
      setCustomerSelect(newData.rows[0].o_5);
      setExport(dataExport);
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
    if (!Export.invoice_id && !invoiceFlag) {
      console.log("kkkkkkk");
      handleCreateInvoice();
      // SnackBarService.alert(t('can_not_found_id_invoice_please_try_again'), true, 'error', 3000)
      return;
    } else if (!Export.customer || !Export.order_dt) {
      console.log("iiiiiiiiii");
      SnackBarService.alert(
        t("message.requireExportInvoice"),
        true,
        "error",
        3000
      );
      return;
    }
    setUpdateProcess(true);
    //bắn event update invoice
    const inputParam = [
      Export.invoice_id,
      Export.customer_id,
      moment(Export.order_dt).format("YYYYMMDD"),
      Export.staff_exp,
      Export.note,
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
      serviceInfo.GET_ALL_PRODUCT_BY_EXPORT_ID,
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
    { label: t("order.export.exp_tp_nm"), key: "exp_tp_nm" },
    { label: t("order.export.qty"), key: "qty" },
    { label: t("order.export.unit_nm"), key: "unit_nm" },
    { label: t("order.export.price"), key: "price" },
    { label: t("order.export.discount_per"), key: "discount_per" },
    { label: t("order.export.vat_per"), key: "vat_per" },
    { label: t(""), key: "space_01" },
    { label: t("order.export.invoice_no"), key: "invoice_no" },
    { label: t("order.export.customer_nm"), key: "customer_nm" },
    { label: t("order.export.order_dt"), key: "order_dt" },
    { label: t("order.export.note"), key: "note" },
    { label: t("order.export.invoice_val"), key: "invoice_val" },
    { label: t("order.export.invoice_discount"), key: "invoice_discount" },
    { label: t("order.export.invoice_vat"), key: "invoice_vat" },
  ];

  const dataCSV = () => {
    let result = dataSource.map((item, index) => {
      const data = item;
      item = {};
      item["stt"] = index + 1;
      item["prod_nm"] = data.o_5;
      item["lot_no"] = data.o_6;
      item["exp_tp_nm"] = data.o_3;
      item["qty"] = data.o_7;
      item["unit_nm"] = data.o_9;
      item["price"] = data.o_10;
      item["discount_per"] = data.o_12;
      item["vat_per"] = data.o_11;

      item["space_01"] = "";
      item["invoice_no"] = Export.invoice_no;
      item["customer_nm"] = Export.customer;
      item["order_dt"] = Export.order_dt
        ? moment(Export.order_dt).format("DD/MM/YYYY")
        : "";
      item["invoice_val"] = Export.invoice_val;
      item["invoice_discount"] = Export.invoice_discount;
      item["invoice_vat"] = Export.invoice_vat;
      item["note"] = Export.note;
      return item;
    });

    return result;
  };

  const handlePrint = useReactToPrint({
    content: () => componentPrint.current,
  });

  console.log(Export,Export.payment_amount)
  console.log(paymentInfo)
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
          invoiceType={invoiceType}
        />
        <Card>
          <CardHeader
            title={t("order.export.productExportList")}
            action={
              <ExportExcel
                filename={`export_${Export.invoice_no}`}
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
                    console.log(item);
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
                                        onRemove(item);
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
                              case "imp_tp":
                                return (
                                  <TableCell
                                    nowrap="true"
                                    key={indexRow}
                                    align={col.align}
                                  >
                                    {value === "1"
                                      ? t("order.export.export_type_buy")
                                      : t("order.export.export_type_selloff")}
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
          <CardHeader title={t("order.export.invoice_info")} />
          <CardContent>
            <Grid container spacing={1}>
              <FormControlLabel
                style={{ margin: 0 }}
                control={
                  <Checkbox
                    style={{ padding: 0 }}
                    checked={invoiceType}
                    onChange={(e) => setInvoiceType(e.target.checked)}
                    name="retail_invoice"
                  />
                }
                label={
                  <>
                    {t("retail_invoice")}
                    <Tooltip title={t("tooltip_retail_invoice")}>
                      <IconButton size="small" aria-label="help">
                        <HelpOutlineIcon />
                      </IconButton>
                    </Tooltip>
                  </>
                }
              />
              <Tooltip placement="top" title={t("auto_invoice")} arrow>
                <TextField
                  fullWidth={true}
                  disabled={invoiceFlag}
                  margin="dense"
                  autoComplete="off"
                  label={t("auto_invoice")}
                  onChange={handleChange}
                  value={Export.invoice_no || ""}
                  name="invoice_no"
                  variant="outlined"
                />
              </Tooltip>
              <div className="d-flex align-items-center w-100">
                <CustomerAdd_Autocomplete
                  value={customerSelect || ""}
                  autoFocus={true}
                  size={"small"}
                  label={t("menu.customer")}
                  onSelect={handleSelectCustomer}
                  onCreate={(id) =>
                    setExport({ ...Export, ...{ customer: id } })
                  }
                  inputRef={step1Ref}
                  onKeyPress={(event) => {
                    if (event.key === "Enter") {
                      step2Ref.current.focus();
                    }
                  }}
                />
              </div>
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <KeyboardDatePicker
                  disableToolbar
                  margin="dense"
                  variant="outlined"
                  style={{ width: "100%" }}
                  inputVariant="outlined"
                  format="dd/MM/yyyy"
                  id="order_dt-picker-inline"
                  label={t("order.export.order_dt")}
                  value={Export.order_dt}
                  onChange={handleDateChange}
                  KeyboardButtonProps={{
                    "aria-label": "change date",
                  }}
                  inputRef={step2Ref}
                  onKeyPress={(event) => {
                    if (event.key === "Enter") {
                      step3Ref.current.focus();
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
                label={t("order.export.note")}
                onChange={handleChange}
                value={Export.note || ""}
                name="note"
                variant="outlined"
                inputRef={step3Ref}
                onKeyPress={(event) => {
                  if (event.key === "Enter") {
                    handleUpdateInvoice();
                  }
                }}
              />
              <NumberFormat
                className="inputNumber"
                style={{ width: "100%" }}
                required
                value={Export.invoice_val || 0}
                label={t("order.export.invoice_val")}
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
                value={Export.invoice_discount || 0}
                label={t("order.export.invoice_discount")}
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
                value={Export.invoice_vat || 0}
                label={t("order.export.invoice_vat")}
                customInput={TextField}
                autoComplete="off"
                margin="dense"
                type="text"
                variant="outlined"
                thousandSeparator={true}
                disabled={true}
              />
              <Divider orientation="horizontal" />
              <NumberFormat
                className="inputNumber"
                style={{ width: "100%" }}
                required
                value={paymentInfo.invoice_needpay}
                label={t("order.export.invoice_needpay")}
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
                value={Export.payment_amount}
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
                  Export.payment_amount - paymentInfo.invoice_needpay > 0
                    ? Export.payment_amount - paymentInfo.invoice_needpay
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
                                label={t('order.export.staff_exp')}
                                onChange={handleChange}
                                value={Export.staff_exp || ''}
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
        <Export_Bill
          headerModal={Export}
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
              {productDeleteModal.o_5 +
                " - " +
                t("order.export.qty") +
                ": " +
                productDeleteModal.o_7 +
                " " +
                productDeleteModal.o_9 +
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

export default InsExport;
