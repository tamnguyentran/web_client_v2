import React, { useState, useCallback, useRef, useEffect, memo } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import {
  Grid,
  Button,
  Divider,
  CardActions,
  TextField,
  Card,
  CardHeader,
  CardContent,
  Dialog,
  Link as LinkMT,
  Drawer,
  List,
  ListItem,
  Chip,
} from "@material-ui/core";
import LoopIcon from "@material-ui/icons/Loop";

import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import DeleteIcon from "@material-ui/icons/Delete";
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
import Dictionary from "../../../../components/Dictionary";
import AddProduct from "../AddProductClone";
import { useReactToPrint } from "react-to-print";
import Import_Bill from "../../../../components/Bill/Import_Bill";
import ExportExcel from "../../../../components/ExportExcel";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import FastForwardIcon from "@material-ui/icons/FastForward";
import { debounce, sortBy } from "lodash";

import ListProductImport from "./ListProductImport";
import InfoInvoice from "./InfoInvoice";

import Breadcrumb from "../../../../components/Breadcrumb/View";

import {
  TitleFilterCpn,
  Wrapper,
  IconButtonCpn,
  ButtonCpn,
  TextFieldCpn,
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

  // useHotkeys('f6', () => handleCreateInvoice(), { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })

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
    newData["invoice_discount"] =
      dataSource.reduce(function (acc, obj) {
        return acc + Math.round((obj.o_15 / 100) * newData.invoice_val);
      }, 0) || 0;
    newData["invoice_vat"] =
      dataSource.reduce(function (acc, obj) {
        return (
          acc +
          Math.round(
            (obj.o_14 / 100) *
              Math.round(newData.invoice_val * (1 - obj.o_15 / 100))
          )
        );
      }, 0) || 0;
    newData["invoice_needpay"] =
      newData.invoice_val - newData.invoice_discount + newData.invoice_vat || 0;
    setPaymentInfo(newData);
    setImport((prevState) => {
      return { ...prevState, ...{ payment_amount: newData.invoice_needpay } };
    });
  }, [dataSource]);

  useEffect(() => {
    dataHistoryListInvoiceRef.current = [];
    getListBill(
      searchModalInvoice.start_dt,
      searchModalInvoice.end_dt,
      searchModalInvoice.last_id,
      searchModalInvoice.id_status,
      searchModalInvoice.vender_nm
    );
  }, [openModalShowBill]);

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

  const getListBill = (startdate, endDate, last_id, id_status, vender_nm) => {
    // setSearchProcess(true)
    const inputParam = [startdate, endDate, last_id, id_status, vender_nm];
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
        // setTotalRecords(0)
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

  const handleChange = (e) => {
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

  const handleAmountChange = (value) => {
    const newImport = { ...Import };
    newImport["payment_amount"] = Number(value.value);
    importDataRef.current = newImport;
    setImport(newImport);
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
        productObject.price,
        productObject.discount_per,
        productObject.vat_per,
      ];
      console.log("inputParam", inputParam);
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
      !!Import.order_dt &&
      disableUpdateInvoice
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
    if (
      Import.payment_type === "2" &&
      (!Import.bank_transf_acc_name ||
        !Import.bank_transf_acc_number ||
        !Import.bank_transf_name ||
        !Import.bank_recei_acc_name ||
        !Import.bank_recei_acc_number ||
        !Import.bank_recei_name)
    )
      return;
    //bắn event tạo invoice
    const inputParam = [
      !!Import.invoice_no ? Import.invoice_no : "AUTO",
      Import.supplier,
      moment(Import.order_dt).format("YYYYMMDD"),
      Import.person_s,
      Import.person_r,
      Import.note,
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
      Import.person_s,
      Import.person_r,
      Import.note,
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
      setIsIndexRow(null);
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
        person_s: newData.rows[0].o_8,
        person_r: newData.rows[0].o_9,
        cancel_reason: newData.rows[0].o_10,
        note: newData.rows[0].o_11,
        invoice_val: newData.rows[0].o_13,
        invoice_discount: newData.rows[0].o_14,
        invoice_vat: newData.rows[0].o_15,
        invoice_settl: newData.rows[0].o_16,
      };
      importRef.current["note"] = newData.rows[0].o_11;
      importRef.current["supplierSelect"] = newData.rows[0].o_5;
      setImport(dataImport);
      setSupplierSelect(newData.rows[0].o_5);
      setIsIndexRow(null);
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
      dataRef.current = newData.rows;
      setDataSource(newData.rows);
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

  // const changePaymentType = () => {
  //   const newData = { ...Import };
  //   if (Import.payment_type === "1") {
  //     newData["payment_type"] = "2";
  //     newData["bank_transf_name"] = null;
  //     newData["bank_transf_acc_name"] = "";
  //     newData["bank_transf_acc_number"] = "";
  //     newData["bank_recei_name"] = null;
  //     newData["bank_recei_acc_number"] = "";
  //     newData["bank_recei_acc_number"] = "";
  //     setImport(newData);
  //     setShouldOpenPaymentModal(true);
  //   } else {
  //     newData["payment_type"] = "1";
  //     setImport(newData);
  //   }
  // };

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
    { label: t("order.import.invoice_discount"), key: "invoice_discount" },
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
      item["invoice_discount"] = Import.invoice_discount;
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

  const handleClickEdit = (item, index) => {
    setIsIndexRow(index);
    setProductInfo({
      ...productInfo,
      expType: item.o_3,
      expQty: item.o_10,
      expPrice: item.o_13,
      expDisCount: item.o_14,
      expVAT: item.o_15,
    });
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

  const updateDataListProduct = (rowData) => {
    if (!rowData) {
      SnackBarService.alert(t("wrongData"), true, "error", 3000);
      return;
    }
    if (
      productInfo.expPrice < 0 ||
      productInfo.expQty <= 0 ||
      productInfo.expVAT < 0 ||
      productInfo.expVAT > 100 ||
      productInfo.expDisCount < 0 ||
      productInfo.expDisCount > 100
    )
      return;
    // setProcess(true)
    const inputParam = [
      newInvoiceId.current,
      rowData.o_1,
      productInfo.expType,
      productInfo.expQty,
      productInfo.expPrice,
      productInfo.expDisCount,
      productInfo.expVAT,
    ];
    sendRequest(
      serviceInfo.UPDATE_PRODUCT_TO_INVOICE,
      inputParam,
      handleResultUpdateProduct,
      true,
      handleTimeOut
    );
  };

  const handleResultUpdateProduct = (reqInfoMap, message) => {
    if (message["PROC_STATUS"] !== 1) {
      // xử lý thất bại
      const cltSeqResult = message["REQUEST_SEQ"];
      glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap);
      control_sv.clearReqInfoMapRequest(cltSeqResult);
    } else if (message["PROC_DATA"]) {
      handleRefresh();
      setIsIndexRow(null);
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
  return (
    <>
      <div className="layout-page p-2">
        <Wrapper.WrapperTable isShowLayout={true} hiddenIcon={true}>
          <div
            style={{ height: "80px" }}
            className="flex justify-content-between p-2"
          >
            <div>
              <div style={{ width: "70%" }}>
                <TextFieldCpn />
              </div>
              <div className="mt-2 text-black fz14">
                Bạn có thể tìm kiếm bằng cách nhập tên/mã SKU hoặc nhập/quét mã
                vạch của sản phẩm
              </div>
            </div>
            <div className="flex aligh-item-center">
              <Button
                style={{ height: "35px" }}
                size="medium"
                className="primary-bg text-white"
                variant="contained"
                onClick={() => {
                  // setShouldOpenModal(true);
                }}
              >
                {/* <IC_ADD className="pr-1" /> */}
                <div>Thêm mới (F2)</div>
              </Button>
              {/* <ButtonCpn>
              </ButtonCpn> */}
              <div className="mr-4 ml-4">
                <div>Hóa đơn 112</div>
                <div>12:30:31 AM</div>
              </div>
              <div className="mr-4">
                <div>Hóa đơn 112</div>
                <div>12:30:31 AM</div>
              </div>
              <div className="mr-4">
                <div>Hóa đơn 112</div>
                <div>12:30:31 AM</div>
              </div>
            </div>
          </div>
          <div
            style={{
              height: "calc(100% - 80px)",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Wrapper.WrapperTable hiddenIcon={true}>bdbd</Wrapper.WrapperTable>
            <Wrapper.WrapperFilter>
              <div
                className="pt-2 pb-2 pl-2 pr-2"
                style={{
                  background: "gray",
                  alignContent: "flex-end",
                  textAlign: "right",
                }}
              >
                Hóa đơn bán lẻ
              </div>
              <div className="p-2">
                <TextFieldCpn
                  label="Mã hoá đơn"
                  placeholder="Nhập tay hoặc tự sinh"
                />
              </div>
            </Wrapper.WrapperFilter>
          </div>
        </Wrapper.WrapperTable>
      </div>
      {true && (
        <Grid container spacing={1} className="h-100">
          <Drawer
            anchor="right"
            open={openModalShowBill}
            onClose={() => {
              setOpenModalShowBill(false);
            }}
          >
            <CardHeader
              title={t("order.export.list_invoice")}
              action={
                <div
                  className="cursor-pointer"
                  onClick={() => {
                    setOpenModalShowBill(false);
                  }}
                >
                  X
                </div>
              }
            />
            <List
              style={{ minWidth: "270px", overflowY: "scroll", height: "auto" }}
            >
              {!dataHistoryListInvoice.length && (
                <ListItem>
                  <div className="w-100">
                    <div className="text-center fz14">
                      {t("order.export.no_invoice_for_the_day")}
                    </div>
                  </div>
                </ListItem>
              )}
              {dataHistoryListInvoice.map((data, index) => {
                return (
                  <>
                    <ListItem
                      button
                      className="w-100"
                      key={index}
                      onClick={() => {
                        newInvoiceId.current = data.o_1;
                        handleRefresh();
                        setOpenModalShowBill(false);
                        setInvoiceFlag(true);
                        setDisableUpdateInvoice(false);
                      }}
                    >
                      <div className="w-100">
                        <div className="fz12">
                          <div className="fz14 font-weight-500"></div>
                          <div>
                            <span className="weight-title">
                              {t("order.export.invoice_no_hd")}
                            </span>
                            <span>: {data.o_2}</span>
                          </div>
                          <div className="flex">
                            <span className="weight-title">
                              {t("order.export.bill_invoice")}
                            </span>
                            <span>
                              : {glb_sv.formatValue(data.o_13, "currency")}
                            </span>
                          </div>
                          <div className="flex">
                            <span className="weight-title">
                              {t("order.export.cust_nm_v")}
                            </span>
                            <span>: {data.o_5}</span>
                          </div>
                          <div>
                            <span className="weight-title">
                              {t("order.export.time_export")}
                            </span>
                            <span>
                              :{" "}
                              {moment(data.o_18, "DDMMYYYYHHmmss").format(
                                "DD/MM/YYYY HH:mm:ss"
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </ListItem>
                    <Divider component="li" />
                  </>
                );
              })}
              <ListItem>
                <div className="d-flex align-items-center justify-content-between">
                  <Chip
                    size="small"
                    variant="outlined"
                    className="mr-1"
                    label={
                      dataHistoryListInvoiceRef.current.length +
                      "/" +
                      totalRecordsListInvoice +
                      " " +
                      t("Hóa đơn")
                    }
                  />
                  <Chip
                    variant="outlined"
                    size="small"
                    className="mr-1"
                    deleteIcon={<FastForwardIcon />}
                    onDelete={() => null}
                    color="primary"
                    label={t("getMoreData")}
                    onClick={getNextDataListInvoice}
                    disabled={
                      dataHistoryListInvoiceRef.current.length >=
                      totalRecordsListInvoice
                    }
                  />
                </div>
              </ListItem>
            </List>
          </Drawer>
          <Grid item md={9} xs={12}>
            <AddProduct
              saveProcess={saveProcess}
              resetFlag={resetFormAddFlag}
              onAddProduct={handleAddProduct}
              style={{ height: "160px" }}
            />
            <Card style={{ height: "calc(100% - 168px)" }}>
              <CardHeader title={t("order.import.productImportListbbb")} />
              <CardContent className="insImportTable">
                <div className="flex justify-content-between aligh-item-center mb-1">
                  <div className="flex aligh-item-center">
                    <TextField
                      style={{ width: "300px" }}
                      size={"small"}
                      label={t("search_btn")}
                      variant="outlined"
                      onChange={handleFilterProduct}
                    />
                  </div>
                  <div>
                    <ExportExcel
                      filename={`import_${Import.invoice_no}`}
                      data={dataCSV()}
                      headers={headersCSV}
                      style={{ backgroundColor: "#00A248", color: "#066190" }}
                    />
                    <DisplayColumn
                      style={{ backgroundColor: "#066190", color: "#fff" }}
                      columns={column}
                      handleCheckChange={onChangeColumnView}
                    />
                  </div>
                </div>
                <ListProductImport
                  column={column}
                  handleClickEdit={handleClickEdit}
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
                  step2Ref={step2Ref}
                  step3Ref={step3Ref}
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid item md={3} xs={12}>
            <InfoInvoice
              setOpenModalShowBill={setOpenModalShowBill}
              setImport={setImport}
              invoiceImportModal={invoiceImportModal}
              setDataSource={setDataSource}
              setInvoiceFlag={setInvoiceFlag}
              setSupplierSelect={setSupplierSelect}
              setIsIndexRow={setIsIndexRow}
              invoiceFlag={invoiceFlag}
              handleChange={handleChange}
              supplierSelect={supplierSelect}
              handleSelectSupplier={handleSelectSupplier}
              step1Ref={step1Ref}
              step2Ref={step2Ref}
              step3Ref={step3Ref}
              Import={Import}
              handleCreateSupplier={handleCreateSupplier}
              handleDateChange={handleDateChange}
              handleUpdateInvoice={handleUpdateInvoice}
              paymentInfo={paymentInfo}
              handleAmountChange={handleAmountChange}
              checkValidate={checkValidate()}
              handlePrint={handlePrint}
            />
          </Grid>
          <div className="dl-none">
            <Import_Bill
              headerModal={Import}
              detailModal={dataSource}
              componentRef={componentPrint}
            />
          </div>

          <Dialog
            fullWidth={true}
            maxWidth="md"
            open={shouldOpenPaymentModal}
            onClose={(e) => {
              setShouldOpenPaymentModal(false);
            }}
          >
            <CardHeader title={t("settlement.payment_transfer")} />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs>
                  <TextField
                    disabled={Import.payment_type === "1"}
                    required={Import.payment_type === "2"}
                    fullWidth={true}
                    margin="dense"
                    autoComplete="off"
                    label={t("report.bank_transf_acc_number")}
                    onChange={handleChange}
                    value={Import.bank_transf_acc_number || ""}
                    name="bank_transf_acc_number"
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs>
                  <TextField
                    disabled={Import.payment_type === "1"}
                    fullWidth={true}
                    margin="dense"
                    required={Import.payment_type === "2"}
                    autoComplete="off"
                    label={t("report.bank_transf_acc_name")}
                    onChange={handleChange}
                    value={Import.bank_transf_acc_name || ""}
                    name="bank_transf_acc_name"
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs>
                  <Dictionary
                    value={Import.bank_transf_name_s || ""}
                    disabled={Import.payment_type === "1"}
                    required={Import.payment_type === "2"}
                    directionName="bank_cd"
                    onSelect={handleSelectTransfBank}
                    label={t("report.bank_transf_name")}
                    style={{ marginTop: 8, marginBottom: 4, width: "100%" }}
                  />
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs>
                  <TextField
                    disabled={Import.payment_type === "1"}
                    required={Import.payment_type === "2"}
                    fullWidth={true}
                    margin="dense"
                    autoComplete="off"
                    label={t("report.bank_recei_acc_number")}
                    onChange={handleChange}
                    value={Import.bank_recei_acc_number || ""}
                    name="bank_recei_acc_number"
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs>
                  <TextField
                    disabled={Import.payment_type === "1"}
                    required={Import.payment_type === "2"}
                    fullWidth={true}
                    margin="dense"
                    autoComplete="off"
                    label={t("report.bank_recei_acc_name")}
                    onChange={handleChange}
                    value={Import.bank_recei_acc_name || ""}
                    name="bank_recei_acc_name"
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs>
                  <Dictionary
                    value={Import.bank_recei_name_s || ""}
                    disabled={Import.payment_type === "1"}
                    required={Import.payment_type === "2"}
                    directionName="bank_cd"
                    onSelect={handleSelectReceiBank}
                    label={t("report.bank_recei_name")}
                    style={{ marginTop: 8, marginBottom: 4, width: "100%" }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Dialog>

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
              <CardHeader title={t("order.import.productDelete")} />
              <CardContent>
                <Grid container>
                  {productDeleteModal.o_6 +
                    " - " +
                    t("order.import.qty") +
                    ": " +
                    productDeleteModal.o_10 +
                    " " +
                    productDeleteModal.o_12 +
                    " (" +
                    t("stt") +
                    " " +
                    productDeleteIndex +
                    ")"}
                </Grid>
              </CardContent>
              <CardActions className="align-items-end justify-content-end">
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
                  startIcon={!deleteProcess && <DeleteIcon />}
                >
                  {t("btn.delete")} (f10)
                </Button>
              </CardActions>
            </Card>
          </Dialog>
        </Grid>
      )}
    </>
  );
};

export default memo(ProductImport);
