import React, { useState, useCallback, useRef, useEffect, memo } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import {
  Grid,
  Button,
  CardActions,
  Card,
  CardHeader,
  CardContent,
  Dialog,
  Link as LinkMT,
  MenuItem,
} from "@material-ui/core";
import LoopIcon from "@material-ui/icons/Loop";

import glb_sv from "../../../../utils/service/global_service";
import control_sv from "../../../../utils/service/control_services";
import SnackBarService from "../../../../utils/service/snackbar_service";
import { requestInfo } from "../../../../utils/models/requestInfo";
import reqFunction from "../../../../utils/constan/functions";
import sendRequest from "../../../../utils/service/sendReq";
import DisplayColumn from "../../../../components/DisplayColumn";
import {
  tableListAddColumn,
  invoiceImportModal,
  searchDefaultModalInvoice,
  defaultDataUpdateProduct,
} from "../Modal/Import.modal";
import moment from "moment";
import AddProduct from "../AddProductClone";
import { useReactToPrint } from "react-to-print";
import Import_Bill from "../../../../components/Bill/Import_Bill";
import ExportExcel from "../../../../components/ExportExcel";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import { debounce, sortBy } from "lodash";

import ListProductImport from "./ListProductImport";

import Breadcrumb from "../../../../components/Breadcrumb/View";
import { ReactComponent as IC_ADD } from "../../../../asset/images/add.svg";
import { ReactComponent as IC_TICK } from "../../../../asset/images/tick.svg";
import { ReactComponent as IC_PRINT } from "../../../../asset/images/print.svg";
import {
  Unit,
  Product,
  AddCustomer,
  Supplier,
  AddSupplier,
} from "../../../../components/Autocomplete";

import {
  Wrapper,
  ButtonCpn,
  TextFieldCpn,
  DatePickerCpn,
  TextAreaCpn,
  SelectCpn,
  CheckBoxCpn,
} from "../../../../basicComponents";

const serviceInfo = {
  CREATE_INVOICE: {
    functionName: "insert",
    reqFunct: reqFunction.IMPORT_CREATE,
    biz: "import",
    object: "imp_invoices",
  },
  UPDATE_INVOICE: {
    functionName: "update",
    reqFunct: reqFunction.IMPORT_UPDATE,
    biz: "import",
    object: "imp_invoices",
  },
  GET_INVOICE_BY_ID: {
    functionName: "get_by_id",
    reqFunct: reqFunction.IMPORT_BY_ID,
    biz: "import",
    object: "imp_invoices",
  },
  GET_ALL_PRODUCT_BY_INVOICE_ID: {
    functionName: "get_all",
    reqFunct: reqFunction.GET_ALL_PRODUCT_BY_INVOICE_ID,
    biz: "import",
    object: "imp_invoices_dt",
  },
  ADD_PRODUCT_TO_INVOICE: {
    functionName: "insert",
    reqFunct: reqFunction.PRODUCT_IMPORT_INVOICE_CREATE,
    biz: "import",
    object: "imp_invoices_dt",
  },
  DELETE_PRODUCT_TO_INVOICE: {
    functionName: "delete",
    reqFunct: reqFunction.PRODUCT_IMPORT_INVOICE_DELETE,
    biz: "import",
    object: "imp_invoices_dt",
  },
  CREATE_SETTLEMENT: {
    functionName: "insert",
    reqFunct: reqFunction.SETTLEMENT_IMPORT_CREATE,
    biz: "settlement",
    object: "imp_settl",
  },
  GET_SETTLEMENT_BY_INVOICE_ID: {
    functionName: "get_by_id",
    reqFunct: reqFunction.SETTLEMENT_IMPORT_BY_INVOICE_ID,
    biz: "settlement",
    object: "imp_settl",
  },
  GET_ALL_BILL: {
    functionName: "get_all",
    reqFunct: reqFunction.REPORT_IMPORT_TIME,
    biz: "import",
    object: "imp_invoices",
  },
  UPDATE_PRODUCT_TO_INVOICE: {
    functionName: "update",
    reqFunct: reqFunction.PRODUCT_IMPORT_INVOICE_UPDATE,
    biz: "import",
    object: "imp_invoices_dt",
  },
};

const ProductImport = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const id = history?.location?.state?.id || 0;
  const [Import, setImport] = useState({ ...invoiceImportModal });
  const [supplierSelect, setSupplierSelect] = useState("");
  const [dataSource, setDataSource] = useState([]);
  const [productDeleteModal, setProductDeleteModal] = useState({});
  // const [productEditID, setProductEditID] = useState(-1);
  const [column, setColumn] = useState([...tableListAddColumn]);
  const [shouldOpenPaymentModal, setShouldOpenPaymentModal] = useState(false);
  const [productDeleteIndex, setProductDeleteIndex] = useState(null);
  const [shouldOpenDeleteModal, setShouldOpenDeleteModal] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState({});
  const [invoiceFlag, setInvoiceFlag] = useState(false);
  const [resetFormAddFlag, setResetFormAddFlag] = useState(false);
  const [deleteProcess, setDeleteProcess] = useState(false);
  const [updateProcess, setUpdateProcess] = useState(false);
  const [saveProcess, setSaveProcess] = useState(false);
  const [searchModalInvoice, setSearchModalInvoice] = useState({
    ...searchDefaultModalInvoice,
  });
  const [openModalShowBill, setOpenModalShowBill] = useState(false);
  const [dataHistoryListInvoice, setDataHistoryListInvoice] = useState([]);
  const [sortColumn, setSortColumn] = useState({
    columIndex: null,
    status: "DESC",
  });
  const [isIndexRow, setIsIndexRow] = useState(null);
  const [productInfo, setProductInfo] = useState({
    ...defaultDataUpdateProduct,
  });
  const [totalRecordsListInvoice, setTotalRecordsListInvoice] = useState(0);

  const [disableUpdateInvoice, setDisableUpdateInvoice] = useState(false);

  const componentPrint = useRef(null);
  const dataWaitAdd = useRef([]);
  const newInvoiceId = useRef(-1);
  const dataSourceRef = useRef([]);
  const dataRef = useRef([]);
  const importDataRef = useRef(invoiceImportModal);
  const totalProductCountAdded = useRef(0);
  const step1Ref = useRef(null);
  const step2Ref = useRef(null);
  const step3Ref = useRef(null);

  const importRef = useRef({});

  const dataHistoryListInvoiceRef = useRef([]);

  useEffect(() => {
    const dataTableTop = JSON.parse(
      localStorage.getItem(`importTableTop-${glb_sv.newVersion}`)
    );
    if (dataTableTop) {
      setColumn(dataTableTop);
      const oldVersion = `importTableTop-${glb_sv.oldVersion}`;
      if (localStorage.getItem(oldVersion)) {
        localStorage.removeItem(oldVersion);
      }
    }
  }, []);
  useEffect(() => {
    const newData = { ...paymentInfo };
    newData["invoice_val"] =
      dataSource.reduce(function (acc, obj) {
        return acc + Math.round(obj.o_10 * obj.o_13);
      }, 0) || 0;

      newData["discount_val"] =
      Import.discount_tp === "1"
        ? Import.discount_val
        : (newData["invoice_val"] * Import.discount_val) / 100;
    newData["invoice_needpay"] =
      newData.invoice_val - newData.discount_val || 0;
    setPaymentInfo(newData);
  }, [dataSource,Import.discount_tp, Import.discount_val]);

  useEffect(() => {
    dataHistoryListInvoiceRef.current = [];
    getListBill(
      searchModalInvoice.start_dt,
      searchModalInvoice.end_dt,
      searchModalInvoice.last_id,
      searchModalInvoice.id_status,
      searchModalInvoice.vender_nm
    );
  }, []);

  useEffect(() => {
    if (id !== 0) {
      newInvoiceId.current = id;
      handleRefresh();
      setOpenModalShowBill(false);
      setInvoiceFlag(true);
      setDisableUpdateInvoice(false);
    }
    return () => {
      history.replace({
        ...history?.location,
        state: undefined,
      });
    };
  }, []);

  const getListBill = (startDate, endDate, last_id, id_status, vender_nm) => {
    // setSearchProcess(true)
    const inputParam = [startDate, endDate, last_id, id_status, vender_nm];
    sendRequest(
      serviceInfo.GET_ALL_BILL,
      inputParam,
      handleResultGetAll,
      true,
      handleTimeOut
    );
  };

  const handleResultGetAll = (reqInfoMap, message) => {
    // setSearchProcess(false)
    if (message["PROC_STATUS"] !== 1) {
      // xử lý thất bại
      const cltSeqResult = message["REQUEST_SEQ"];
      glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap);
      control_sv.clearReqInfoMapRequest(cltSeqResult);
    } else if (message["PROC_DATA"]) {
      let newData = message["PROC_DATA"];
      if (newData.rows.length > 0) {
        dataHistoryListInvoiceRef.current =
          dataHistoryListInvoiceRef.current.concat(newData.rows);
        setDataHistoryListInvoice(dataHistoryListInvoiceRef.current);
        if (reqInfoMap.inputParam[2] === glb_sv.defaultValueSearch) {
          setTotalRecordsListInvoice(newData.rowTotal);
        } else {
          setTotalRecordsListInvoice(
            dataHistoryListInvoiceRef.current.length -
              newData.rows.length +
              newData.rowTotal
          );
        }
      } else {
        dataHistoryListInvoiceRef.current = [];
        setDataHistoryListInvoice([]);
      }
    }
  };

  //-- xử lý khi timeout -> ko nhận được phản hồi từ server
  const handleTimeOut = (e) => {
    SnackBarService.alert(t(`message.${e.type}`), true, 4, 3000);
    setDeleteProcess(false);
    setUpdateProcess(false);
  };

  const resultCreateSettlement = (
    message = {},
    cltSeqResult = 0,
    reqInfoMap = new requestInfo()
  ) => {
    control_sv.clearTimeOutRequest(reqInfoMap.timeOutKey);
    if (reqInfoMap.procStat !== 0 && reqInfoMap.procStat !== 1) {
      return;
    }
    reqInfoMap.procStat = 2;
    SnackBarService.alert(
      message["PROC_MESSAGE"],
      true,
      message["PROC_STATUS"],
      3000
    );
    dataSourceRef.current = [];
    dataRef.current = [];
    totalProductCountAdded.current = 0;
    importDataRef.current = invoiceImportModal;
    setImport({ ...invoiceImportModal });
    setDataSource([]);
    setSupplierSelect("");
    if (message["PROC_STATUS"] === 2) {
      reqInfoMap.resSucc = false;
      glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap);
      control_sv.clearReqInfoMapRequest(cltSeqResult);
    } else {
    }
  };
  const handleSelectSupplier = (obj) => {
    const newImport = { ...Import };
    newImport["supplier"] = !!obj ? obj?.o_1 : null;

    if (
      importRef.current?.supplierSelect !== (!!obj ? obj?.o_2 : "") ||
      importRef.current?.note !== Import.note
    ) {
      setDisableUpdateInvoice(true);
    } else {
      setDisableUpdateInvoice(false);
    }

    importDataRef.current = newImport;
    setSupplierSelect(!!obj ? obj?.o_2 : "");
    setImport(newImport);
  };

  const handleCreateSupplier = (id) => {
    const newImport = { ...Import };
    newImport["supplier"] = id;
    importDataRef.current = newImport;
    setImport(newImport);
  };

  const handleDateChange = (date) => {
    const newImport = { ...Import };
    newImport["order_dt"] = date;
    importDataRef.current = newImport;
    setImport(newImport);
  };

  const handleChangeCodeBill = (e) => {
    const { name, value } = e.target;
    setImport((pre) => ({ ...pre, [`${name}`]: value }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setImport((pre) => ({ ...pre, [`${name}`]: value }));
    if (e.target.name === "note") {
      if (
        importRef.current?.note !== e.target.value ||
        importRef.current?.supplierSelect !== supplierSelect
      ) {
        setDisableUpdateInvoice(true);
      } else {
        setDisableUpdateInvoice(false);
      }
    }
    const newImport = { ...Import };
    newImport[e.target.name] = e.target.value;
    if (e.target.name === "payment_type" && e.target.value === "1") {
      newImport["bank_transf_name"] = null;
      newImport["bank_transf_acc_name"] = "";
      newImport["bank_transf_acc_number"] = "";
      newImport["bank_recei_name"] = null;
      newImport["bank_recei_acc_number"] = "";
      newImport["bank_recei_acc_number"] = "";
      importDataRef.current = newImport;
      setImport(newImport);
    } else {
      importDataRef.current = newImport;
      setImport(newImport);
    }
  };

  const handleAmountChange = (e) => {
    // const newImport = { ...Import };
    // newImport["payment_amount"] = Number(value.value);
    // importDataRef.current = newImport;
    // setImport(newImport);
    const { value, name } = e.target;
    if (value === "") return setImport((pre) => ({ ...pre, [`${name}`]: 0 }));
    setImport((pre) => ({
      ...pre,
      [`${name}`]: glb_sv.formatValue(value, "number"),
    }));
  };

  const handleSelectTransfBank = (obj) => {
    const newImport = { ...Import };
    newImport["bank_transf_name"] = !!obj ? obj?.o_1 : null;
    newImport["bank_transf_name_s"] = !!obj ? obj?.o_2 : null;
    importDataRef.current = newImport;
    setImport(newImport);
  };

  const handleSelectReceiBank = (obj) => {
    const newImport = { ...Import };
    newImport["bank_recei_name"] = !!obj ? obj?.o_1 : null;
    newImport["bank_recei_name_s"] = !!obj ? obj?.o_2 : null;
    importDataRef.current = newImport;
    setImport(newImport);
  };

  const handleAddProduct = (productObject) => {
    setSaveProcess(true);
    if (!Import.supplier || !Import.order_dt) {
      setSaveProcess(false);
      SnackBarService.alert(t("message.requireImportInvoice"), true, 4, 3000);
      return;
    } else if (!invoiceFlag) {
      dataWaitAdd.current.push(productObject);
      handleCreateInvoice();
      return;
    } else {
      const inputParam = [
        newInvoiceId.current,
        productObject.imp_tp,
        productObject.prod_id,
        productObject.lot_no,
        productObject.made_dt,
        moment(productObject.exp_dt).format("YYYYMMDD"),
        productObject.qty,
        productObject.unit_id,
        Number(productObject.price) || 0,
        0,
        0,
      ];
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
    setProductDeleteModal(!!item ? item : {});
    setShouldOpenDeleteModal(!!item ? true : false);
  };

  const handleDelete = () => {
    if (!productDeleteModal.o_1 || !productDeleteModal.o_2) return;
    setDeleteProcess(true);
    const inputParam = [productDeleteModal.o_2, productDeleteModal.o_1];
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
      setProductDeleteIndex(null);
      setProductDeleteModal({});
      setShouldOpenDeleteModal(false);
      handleRefresh();
    }
  };

  const checkValidate = () => {
    if (
      invoiceFlag &&
      !!Import.supplier &&
      !!Import.order_dt
    ) {
      return false;
    }
    return true;
  };

  const handleCreateInvoice = () => {
    if (!Import.supplier || !Import.order_dt) {
      setSaveProcess(false);
      SnackBarService.alert(t("message.supplierRequire"), true, 4, 3000);
      return;
    }
    if (!Import.payment_type || Import.payment_amount < 0) return;
    //bắn event tạo invoice
    const inputParam = [
      !!Import.invoice_no ? Import.invoice_no : "AUTO",
      Import.supplier,
      moment(Import.order_dt).format("YYYYMMDD"),
      "",
      "",
      "1",
      0,
      "",
    ];
    sendRequest(
      serviceInfo.CREATE_INVOICE,
      inputParam,
      handleResultCreateInvoice,
      true,
      handleTimeOut
    );
  };

  const handleUpdateInvoice = () => {
    if (!Import.invoice_id && !invoiceFlag) {
      handleCreateInvoice();
      return;
    } else if (!Import.supplier || !Import.order_dt) {
      SnackBarService.alert(
        t("message.requireImportInvoice"),
        true,
        "error",
        3000
      );
      return;
    }
    setUpdateProcess(true);
    //bắn event update invoice
    const inputParam = [
      Import.invoice_id,
      Import.supplier,
      moment(Import.order_dt).format("YYYYMMDD"),
      "",
      "",
      Import.discount_tp || "1",
      Import?.discount_val || 0,
      "",
    ];

    sendRequest(
      serviceInfo.UPDATE_INVOICE,
      inputParam,
      handleResultUpdateInvoice,
      true,
      handleTimeOut
    );

    // bắn event update tiền hđ thanh toán (settlement)
    sendRequest(
      serviceInfo.GET_SETTLEMENT_BY_INVOICE_ID,
      [Import.invoice_id],
      handleResultGetSettlementByInvoiceID,
      true,
      handleTimeOut
    );
  };

  const handleResultGetSettlementByInvoiceID = (reqInfoMap, message) => {
    if (message["PROC_STATUS"] !== 1) {
      // xử lý thất bại
      const cltSeqResult = message["REQUEST_SEQ"];
      glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap);
      control_sv.clearReqInfoMapRequest(cltSeqResult);
    } else if (message["PROC_DATA"]) {
      let newData = message["PROC_DATA"];
      if (newData.rowTotal === 0) {
        // chưa có bút toán nào => tạo bút toán cho nó
      }
    }
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
      sendRequest(
        serviceInfo.GET_INVOICE_BY_ID,
        [newInvoiceId.current],
        handleResultGetInvoiceByID,
        true,
        handleTimeOut
      );
    }
  };

  const handleResultCreateInvoice = (reqInfoMap, message) => {
    SnackBarService.alert(
      message["PROC_MESSAGE"],
      true,
      message["PROC_STATUS"],
      3000
    );
    setSaveProcess(false);
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
              item.imp_tp,
              item.prod_id,
              item.lot_no,
              item.made_dt,
              moment(item.exp_dt).format("YYYYMMDD"),
              item.qty,
              item.unit_id,
              glb_sv.formatValue(item.price || 0, "number"),
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
    SnackBarService.alert(
      message["PROC_MESSAGE"],
      true,
      message["PROC_STATUS"],
      3000
    );
    setDisableUpdateInvoice(false);
    setSaveProcess(false);
    if (message["PROC_STATUS"] !== 1) {
      // xử lý thất bại
      const cltSeqResult = message["REQUEST_SEQ"];
      glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap);
      control_sv.clearReqInfoMapRequest(cltSeqResult);
    } else if (message["PROC_DATA"]) {
      // xử lý thành công
      dataWaitAdd.current = [];
      setResetFormAddFlag(true);
      dataHistoryListInvoiceRef.current = [];
      getListBill(
        searchModalInvoice.start_dt,
        searchModalInvoice.end_dt,
        searchModalInvoice.last_id,
        searchModalInvoice.id_status,
        searchModalInvoice.vender_nm
      );
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
      let dataImport = {
        invoice_id: newData.rows[0].o_1,
        invoice_no: newData.rows[0].o_2,
        invoice_stat: newData.rows[0].o_3,
        supplier: newData.rows[0].o_4,
        supplier_nm: newData.rows[0].o_5,
        order_dt: moment(newData.rows[0].o_6, "YYYYMMDD").toString(),
        person_s: newData.rows[0].o_10,
        person_r: newData.rows[0].o_11,
        cancel_reason: newData.rows[0].o_12,
        note: newData.rows[0].o_13,
        invoice_val: newData.rows[0].o_15,
        // discount_val: newData.rows[0].o_16,
        invoice_vat: newData.rows[0].o_17,
        invoice_settl: newData.rows[0].o_18,
        discount_tp: newData.rows[0].o_8,
        discount_val: newData.rows[0].o_9,
        payment_amount:0
      };
      importRef.current["note"] = newData.rows[0].o_11;
      importRef.current["supplierSelect"] = newData.rows[0].o_5;
      setImport(dataImport);
      setSupplierSelect(newData.rows[0].o_5);
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
      dataRef.current = newData.rows || [];
      setDataSource(newData.rows || []);
      let convertData = message["PROC_DATA"].rows.map((item) => ({
        expPrice: item.o_13,
        expQty: item.o_10,
      }));
      setProductInfo(convertData);
    }
  };

  const handleRefresh = () => {
    sendRequest(
      serviceInfo.GET_INVOICE_BY_ID,
      [newInvoiceId.current],
      handleResultGetInvoiceByID,
      true,
      handleTimeOut
    );
    sendRequest(
      serviceInfo.GET_ALL_PRODUCT_BY_INVOICE_ID,
      [newInvoiceId.current],
      handleGetAllProductByInvoiceID,
      true,
      handleTimeOut
    );
  };

  const headersCSV = [
    { label: t("stt"), key: "stt" },
    { label: t("order.import.prod_nm"), key: "prod_nm" },
    { label: t("order.import.imp_tp_nm"), key: "imp_tp_nm" },
    { label: t("order.import.lot_no"), key: "lot_no" },
    { label: t("order.import.exp_dt"), key: "exp_dt" },
    { label: t("order.import.qty"), key: "qty" },
    { label: t("order.import.unit_nm"), key: "unit_nm" },
    { label: t("order.import.price"), key: "price" },
    { label: t("order.import.discount_per"), key: "discount_per" },
    { label: t("order.import.vat_per"), key: "vat_per" },
    { label: t(""), key: "space_01" },
    { label: t("order.import.invoice_no"), key: "invoice_no" },
    { label: t("order.import.vender_nm"), key: "supplier_nm" },
    { label: t("order.import.order_dt"), key: "order_dt" },
    { label: t("order.import.note"), key: "note" },
    { label: t("order.import.invoice_val"), key: "invoice_val" },
    { label: t("order.import.discount_val"), key: "discount_val" },
    { label: t("order.import.invoice_vat"), key: "invoice_vat" },
  ];

  const dataCSV = () => {
    let result = dataSource.map((item, index) => {
      const data = item;
      item = {};
      item["stt"] = index + 1;
      item["imp_tp_nm"] = data.o_4;
      item["prod_nm"] = data.o_6;
      item["lot_no"] = data.o_7;
      item["exp_dt"] = data.o_9
        ? moment(data.o_9, "YYYYMMDD").format("DD/MM/YYYY")
        : "";
      item["qty"] = data.o_10;
      item["unit_nm"] = data.o_12;
      item["price"] = data.o_13;
      item["discount_per"] = data.o_14;
      item["vat_per"] = data.o_15;

      item["space_01"] = "";
      item["invoice_no"] = Import.invoice_no;
      item["supplier_nm"] = Import.supplier_nm;
      item["order_dt"] = Import.order_dt
        ? moment(Import.order_dt).format("DD/MM/YYYY")
        : "";
      item["invoice_val"] = Import.invoice_val;
      item["discount_val"] = Import.discount_val;
      item["invoice_vat"] = Import.invoice_vat;
      item["note"] = Import.note;
      return item;
    });

    return result;
  };

  const handlePrint = useReactToPrint({
    content: () => componentPrint.current,
  });

  const onChangeColumnView = (item) => {
    const newColumn = [...column];
    const index = newColumn.findIndex((obj) => obj.field === item.field);
    if (index >= 0) {
      newColumn[index]["show"] = !column[index]["show"];
      localStorage.setItem(
        `importTableTop-${glb_sv.newVersion}`,
        JSON.stringify(newColumn)
      );
      setColumn(newColumn);
    }
  };

  const handleClickSortColum = (col, index) => {
    let sortData;
    if (sortColumn?.status === "DESC") {
      sortData = sortBy(dataSource, [col.field], "DESC");
      setSortColumn({ columIndex: index, status: "DSC" });
    } else {
      sortData = sortBy(dataSource, [col.field]).reverse();
      setSortColumn({ columIndex: index, status: "DESC" });
    }
    setDataSource(sortData);
  };

  const showIconSort = () => {
    switch (sortColumn?.status) {
      case "DSC":
        return <ExpandLessIcon />;
      case "DESC":
        return <KeyboardArrowDownIcon />;
      default:
        return null;
    }
  };

  const handleChangeUpdate = (inputKey, inputValue) => {
    const newProductInfo = { ...productInfo };
    if (inputKey === "expPrice" || inputKey === "expQty") {
      newProductInfo[inputKey] = inputValue;
    } else {
      newProductInfo[inputKey] =
        inputValue >= 0 && inputValue <= 100 ? Math.round(inputValue) : 10;
    }
    setProductInfo(newProductInfo);
  };

  const handleChangeType = (e, item) => {
    const newProductInfo = { ...productInfo };
    newProductInfo[e.target.name] = e.target.value;
    if (e.target.value !== "1") {
      newProductInfo["expPrice"] = 0;
      newProductInfo["expDisCount"] = 0;
      newProductInfo["expVAT"] = 0;
      setProductInfo(newProductInfo);
    } else {
      newProductInfo["expPrice"] = item.o_13;
      newProductInfo["expDisCount"] = item.o_14;
      newProductInfo["expVAT"] = item.o_15;
      setProductInfo(newProductInfo);
    }
  };

  const updateDataListProduct = useCallback(
    debounce((qty, price, item) => {
      if (!item.o_1) {
        SnackBarService.alert(t("wrongData"), true, "error", 3000);
        return;
      }
      if (price < 0 || qty < 1) return;
      const inputParam = [
        newInvoiceId.current,
        item.o_1, // ID dòng dữ liệu
        item.o_3, // Mã loại hình nhập
        qty, // Số lượng
        price, // Giá
        0,
        0,
      ];
      sendRequest(
        serviceInfo.UPDATE_PRODUCT_TO_INVOICE,
        inputParam,
        handleResultUpdateProduct,
        (e) => {
          sendRequest(
            serviceInfo.GET_ALL_PRODUCT_BY_INVOICE_ID,
            [newInvoiceId.current],
            handleGetAllProductByInvoiceID,
            true,
            handleTimeOut
          );
          handleTimeOut(e);
        },
        handleTimeOut
      );
    }, 800),
    []
  );

  const handleResultUpdateProduct = (reqInfoMap, message) => {
    if (message["PROC_STATUS"] !== 1) {
      // xử lý thất bại
      SnackBarService.alert(
        message["PROC_MESSAGE"],
        true,
        message["PROC_STATUS"],
        3000
      );
      const cltSeqResult = message["REQUEST_SEQ"];
      glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap);
      control_sv.clearReqInfoMapRequest(cltSeqResult);
      handleRefresh();
    } else if (message["PROC_DATA"]) {
      handleRefresh();
    }
  };

  const handleFilterProduct = (e) => {
    e.target.value = e.target.value.trim().toUpperCase();
    if (e.target.value === "") {
      handleRefresh();
    } else {
      debouncedSave({ value: e.target.value, dataRef: dataRef.current });
    }
  };

  const debouncedSave = useCallback(
    debounce((data) => {
      let result = data.dataRef.filter((item) => {
        return (
          data.value.search(item.o_6) != -1 || item.o_6.search(data.value) != -1
        );
      });
      setDataSource(result);
    }, 100),
    []
  );

  const getNextDataListInvoice = () => {
    const lastIndex = dataHistoryListInvoiceRef.current.length - 1;
    const last_id = dataHistoryListInvoiceRef.current[lastIndex].o_1;
    getListBill(
      searchModalInvoice.start_dt,
      searchModalInvoice.end_dt,
      last_id,
      searchModalInvoice.id_status,
      searchModalInvoice.vender_nm
    );
  };

  const handleChangeInvoiceDiscount = (e) => {
    const { value, name } = e.target;
    if (value === "") return setImport((pre) => ({ ...pre, [`${name}`]: 0 }));
    if (Import?.discount_tp === "1") {
      setImport((pre) => ({
        ...pre,
        [`${name}`]: glb_sv.formatValue(value, "number"),
      }));
    } else if (
      Import?.discount_tp === "2" &&
      glb_sv.formatValue(value, "number") > 0 &&
      glb_sv.formatValue(value, "number") <= 100
    ) {
      setImport((pre) => ({
        ...pre,
        [`${name}`]: glb_sv.formatValue(value, "number"),
      }));
    }
  };

  const handleChangeDiscount = (e) => {
    const { value, name } = e.target;
    setImport((pre) => ({ ...pre, [`${name}`]: value, discount_val: 0 }));
  };

  const handleSupplierId = (value) => {
    setImport((pre) => ({ ...pre, supplier: value }));
  };

  return (
    <>
      <div className="layout-page p-2">
        <Wrapper.WrapperTable isShowLayout={true} hiddenIcon={true}>
        <Wrapper.WrapperHeader className="border-none">
            <div>
              <Breadcrumb description="Đây là trang giúp bạn nhập hàng cho nhà thuốc" />
            </div>
            <div className="flex align-item-center justify-content-end">
              <Button
                size="medium"
                className="height-btn primary-bg text-white"
                variant="contained"
                onClick={() => {
                  setImport({ ...invoiceImportModal });
                  setDataSource([]);
                  setInvoiceFlag(false);
                  setSupplierSelect("");
                }}
              >
                <IC_ADD />
                <div>H.Đ mới</div>
              </Button>
              <div
                className="flex cursor-pointer ml-2"
                style={{
                  overflowX: "auto",
                  maxWidth: `${
                    dataHistoryListInvoice.length <= 4
                      ? 100 * dataHistoryListInvoice.length + "px"
                      : "400px"
                  }`,
                }}
              >
                {dataHistoryListInvoice.map((item, index) => {
                  return (
                    <div
                      key={index}
                      className="mr-2 ml-2"
                      onClick={() => {
                        newInvoiceId.current = item.o_1;
                        handleRefresh();
                        setOpenModalShowBill(false);
                        setInvoiceFlag(true);
                        setIsIndexRow(null);
                        setDisableUpdateInvoice(false);
                      }}
                    >
                      <div className="fz11 text-center text-black2 item-receipt">
                        {item.o_2}
                      </div>
                      <div className="fz11 text-green2 text-center">
                        {moment(item.o_20, "DDMMYYYYhhmmss").format('hh:mm:ss')}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Wrapper.WrapperHeader>
          <div
            style={{ height: "calc(100% - 80px)" }}
            className="flex justify-content-between"
          >
            <Wrapper.WrapperTable
              hiddenIcon={true}
              style={{ width: "calc(100% - 22% - 8px)", minWidth: "800px" }}
            >
              <AddProduct
                saveProcess={saveProcess}
                resetFlag={resetFormAddFlag}
                onAddProduct={handleAddProduct}
                style={{ height: "160px" }}
              />
              <ListProductImport
                column={column}
                isIndexRow={isIndexRow}
                setIsIndexRow={setIsIndexRow}
                updateDataListProduct={updateDataListProduct}
                onRemove={onRemove}
                setProductDeleteIndex={setProductDeleteIndex}
                handleChangeType={handleChangeType}
                handleChangeUpdate={handleChangeUpdate}
                dataSource={dataSource}
                handleClickSortColum={handleClickSortColum}
                sortColumn={sortColumn}
                showIconSort={showIconSort}
                productInfo={productInfo}
                setProductInfo={setProductInfo}
                step2Ref={step2Ref}
                step3Ref={step3Ref}
              />
            </Wrapper.WrapperTable>
            <Wrapper.WrapperFilter style={{ width: "22%" }}>
              <div className="pt-2 pb-2 pl-2 pr-2 gray3-bg align-items-center text-right">
                Thông tin hóa đơn
              </div>
              <div className="p-2">
                <TextFieldCpn
                  label="Số hoá đơn"
                  placeholder="Nhập tay hoặc tự sinh"
                disabled={invoiceFlag}
                className="uppercaseInput"
                onChange={handleChangeCodeBill}
                value={Import.invoice_no || ""}
                name="invoice_no"
                />
                <AddSupplier
                  handleSupplierId={handleSupplierId}
                  closeIcon={() => {}}
                  value={supplierSelect || ""}
                  size={"small"}
                  onSelect={handleSelectSupplier}
                  onCreate={handleCreateSupplier}
                  inputRef={step1Ref}
                  label={"Nhà cung ứng (*)"}
                  onKeyPress={(event) => {
                    if (event.key === "Enter") {
                      step2Ref.current.focus();
                    }
                  }}
                />
                <DatePickerCpn
                  className="mt-1"
                  label="Ngày nhập hàng (*)"
                  format="dd/MM/yyyy"
                />
                 <TextFieldCpn
                  value={glb_sv.formatValue(
                    Import.invoice_val || 0,
                    "currency"
                  )}
                  align="right"
                  className="mt-1"
                  label={t("Giá trị HĐ")}
                  disabled={true}
                />
                <div className="flex align-items-end mt-1">
                  <div className="mr-2" style={{ width: "50%" }}>
                    <SelectCpn
                      value={Import.discount_tp}
                      onChange={handleChangeDiscount}
                      name="discount_tp"
                      label="Loại chiết khấu"
                    >
                      <MenuItem value="1">{t("Tiền mặt")}</MenuItem>
                      <MenuItem value="2">{t("% Hóa đơn")}</MenuItem>
                    </SelectCpn>
                  </div>
                  
                  <div style={{ width: "50%" }}>
                    <TextFieldCpn
                      value={glb_sv.formatValue(
                        Import.discount_val || 0,
                        "number"
                      )}
                      label={" "}
                      name="discount_val"
                      onChange={handleChangeInvoiceDiscount}
                      disabled={!Import?.discount_tp}
                      align="right"
                    />
                  </div>
                </div>
                <TextFieldCpn
                  value={glb_sv.formatValue(
                    Math.round(paymentInfo.invoice_needpay) || 0,
                    "currency"
                  )}
                  align="right"
                  className="mt-1"
                  label={t("Thành tiền")}
                  disabled={true}
                />
                <TextFieldCpn
                  align="right"
                  className="mt-1"
                  label={t("Nhà thuốc trả")}
                  name="payment_amount"
                  value={glb_sv.formatValue(
                    Math.round(paymentInfo.invoice_needpay) || 0,
                    "currency"
                  )}
                  onChange={handleAmountChange}
                  disabled = {Import.invoice_val === 0}
                />
                <TextFieldCpn
                  align="right"
                  className="mt-1"
                  label={t("Tiền thừa")}
                  value={glb_sv.formatValue(
                    Import.payment_amount - paymentInfo.invoice_needpay > 0
                      ? Import.payment_amount - paymentInfo.invoice_needpay
                      : 0,
                    "number"
                  )}
                  disabled={true}
                />
                <div className="flex justify-content-between mt-4">
                  <Button
                    onClick={handlePrint}
                    disabled={!invoiceFlag}
                    className={invoiceFlag ? "black-bg text-white" : ""}
                    id="buttonPrint"
                    size="small"
                    variant="contained"
                    style={{
                      height: "var(--heightInput)",
                      width: "22%",
                    }}
                  >
                    <IC_PRINT />
                  </Button>
                  <Button
                    style={{ height: "var(--heightInput)", width: "75%" }}
                    size="medium"
                    variant="contained"
                    onClick={handleUpdateInvoice}
                    disabled={checkValidate()}
                    className={
                      checkValidate() === false
                        ? updateProcess
                          ? "bg-success text-white"
                          : "primary-bg text-white"
                        : ""
                    }
                  >
                    {updateProcess ? (
                      <LoopIcon className="button-loading" />
                    ) : (
                      <IC_TICK className="pr-1" />
                    )}
                    <div>Thanh toán</div>
                  </Button>
                </div>
              </div>
            </Wrapper.WrapperFilter>
          </div>
        </Wrapper.WrapperTable>
        <Dialog
          maxWidth="xs"
          fullWidth={true}
          TransitionProps={{
            addEndListener: (node, done) => {
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
            <CardHeader
              className="card-header"
              title={t("Xác nhận xóa sản phẩm ?")}
            />
            <CardContent>
              <Grid container>
                {productDeleteModal.o_6 +
                  " - " +
                  t("Số lượng xuất") +
                  ": " +
                  productDeleteModal.o_10 +
                  " " +
                  productDeleteModal.o_12}
              </Grid>
            </CardContent>
            <CardActions className="align-items-end justify-content-end">
              <ButtonCpn.ButtonClose
                process={deleteProcess}
                onClick={(e) => {
                  setShouldOpenDeleteModal(false);
                }}
              />
              <ButtonCpn.ButtonDelete
                onClick={handleDelete}
                disabled={deleteProcess}
                process={deleteProcess}
              />
            </CardActions>
          </Card>
        </Dialog>
        <div className="dl-none">
            <Import_Bill
              headerModal={Import}
              detailModal={dataSource}
              componentRef={componentPrint}
              paymentInfo={paymentInfo}
            />
          </div>
      </div>
    </>
  );
};

export default memo(ProductImport);
