import React, { useState, useRef, useEffect, useCallback } from "react";
import "./Export.css";
import { MuiThemeProvider, createTheme } from "@material-ui/core/styles";
import moment from "moment";
import { useTranslation } from "react-i18next";
import TextImage from "../../../../components/TextImage";
import Modal from "../../../../components/Modal/View";
import AddShoppingCartIcon from "@material-ui/icons/AddShoppingCart";
import HistoryIcon from "@material-ui/icons/History";
import FastForwardIcon from "@material-ui/icons/FastForward";
import { debounce, sortBy } from "lodash";
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
  FormControlLabel,
  Select,
  MenuItem,
  ImageListItem,
  ImageListItemBar,
  ListItem,
  Avatar,
  List,
  Dialog,
  CardActions,
  FormControl,
  Switch,
  Drawer,
  Chip,
} from "@material-ui/core";
import Breadcrumb from "../../../../components/Breadcrumb/View";
import DateFnsUtils from "@date-io/date-fns";
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from "@material-ui/pickers";
import NumberFormat from "react-number-format";
import IconButton from "@material-ui/core/IconButton";
import LoopIcon from "@material-ui/icons/Loop";
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";
import glb_sv from "../../../../utils/service/global_service";
import control_sv from "../../../../utils/service/control_services";
import SnackBarService from "../../../../utils/service/snackbar_service";
import reqFunction from "../../../../utils/constan/functions";
import sendRequest from "../../../../utils/service/sendReq";
import DisplayColumn from "../../../../components/DisplayColumn";
import Dictionary_Autocomplete from "../../../../components/Dictionary_Autocomplete/index";
import { invoiceExportModal, tableListAddColumn1 } from "../Modal/Export.modal";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import CustomerAdd_Autocomplete from "../../../Partner/Customer/Control/CustomerAdd.Autocomplete";
import { useReactToPrint } from "react-to-print";
import Export_Bill from "../../../../components/Bill/Export_Bill";
import ExportExcel from "../../../../components/ExportExcel";
import ImportExcel1 from '../../../../components/ImportExcel1'
import ImportExcel from '../../../../components/ImportExcel'
import {
  searchDefaultModal,
  defaultDataUpdateProduct,
} from "../Modal/Export.modal";
import { ReactComponent as IC_ADD_BASIC } from "../../../../asset/images/add-basic.svg";
import DeleteIcon from "@material-ui/icons/Delete";
import CancelIcon from "@material-ui/icons/Cancel";
import SaveIcon from "@material-ui/icons/Save";
import SearchIcon from "@material-ui/icons/Search";
import BorderColorIcon from "@material-ui/icons/BorderColor";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import { ContactlessOutlined } from "@material-ui/icons";

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
  SEARCH_INVEN_PROD: {
    functionName: "search_inven_prod",
    reqFunct: reqFunction.SEARCH_INVEN_PROD,
    biz: "report",
    object: "rp_inventory",
  },
  GET_ALL: {
    functionName: "inven_lotno",
    reqFunct: reqFunction.REPORT_INVENTORY_LOTNO,
    biz: "report",
    object: "rp_inventory",
  },
  GET_ALL_LIST_INVOICE: {
    functionName: "get_all",
    reqFunct: reqFunction.EXPORT_LIST,
    biz: "export",
    object: "exp_invoices",
  },
};

const theme = createTheme({
  breakpoints: {
    keys: ["xs", "sm", "md", "lg", "xl", "xxl"],
    values: { xs: 0, sm: 568, md: 760, lg: 1100, xl: 1200, xxl: 1500 },
  },
});
const InsExport = () => {
  const { t } = useTranslation();
  const [Export, setExport] = useState({ ...invoiceExportModal });
  const [customerSelect, setCustomerSelect] = useState("");
  const [dataSource, setDataSource] = useState([]);
  const [column, setColumn] = useState([...tableListAddColumn1]);
  const [paymentInfo, setPaymentInfo] = useState({});
  const [updateProcess, setUpdateProcess] = useState(false);
  const [invoiceFlag, setInvoiceFlag] = useState(false);
  const [invoiceType, setInvoiceType] = useState(true);
  const [isScan, setIsScan] = useState(true);
  const [dataSearchInput, setDataSearchInput] = useState("");
  const [listInventoryProduct, setListInventoryProduct] = useState([]);
  const [open, setOpen] = useState(false);
  const [typeSale, setTypeSale] = useState("1");
  const [expPrice, setExpPrice] = useState(0);
  const [isIndexRow, setIsIndexRow] = useState(null);
  const [productDeleteModal, setProductDeleteModal] = useState({});
  const [productDeleteIndex, setProductDeleteIndex] = useState(null);
  const [shouldOpenDeleteModal, setShouldOpenDeleteModal] = useState(false);
  const [deleteProcess, setDeleteProcess] = useState(false);
  // const [searchProcess, setSearchProcess] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchModal, setSearchModal] = useState({ ...searchDefaultModal });
  const [listInventory, setListInventory] = useState([]);
  const [openModalShowBill, setOpenModalShowBill] = useState(false);
  const [dataHistoryListInvoice, setDataHistoryListInvoice] = useState([]);
  const [barCode, setBarCode] = useState('')
  const [dataProductBarCode, setDataProductBarCode] = useState({})
  const [productInfo, setProductInfo] = useState({
    ...defaultDataUpdateProduct,
  });

  const [sortColumn, setSortColumn] = useState({columIndex: null, status: 'DESC'});

  const componentPrint = useRef(null);
  const dataWaitAdd = useRef({});
  const newInvoiceId = useRef(-1);
  const dataSourceRef = useRef([]);

  const step2Ref = useRef(null);
  const step3Ref = useRef(null);
  const step4Ref = useRef(null);

  const dataProduct = useRef(null)

  useEffect(() => {
    const dataTableTop = JSON.parse(
      localStorage.getItem(`exportTableTop-${glb_sv.newVersion}`)
    );
    if (dataTableTop) {
      setColumn(dataTableTop);
      const oldVersion = `exportTableTop-${glb_sv.oldVersion}`;
      if (localStorage.getItem(oldVersion)) {
        localStorage.removeItem(oldVersion);
      }
    }
  }, []);
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
        console.log(obj)
        return (
          acc +
          Math.round(
            (obj.o_12 / 100) *
              Math.round((newData.invoice_val) * (1 - obj.o_11 / 100))
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

  useEffect(() => {
    dataSourceRef.current = [];
    getList(
      glb_sv.defaultValueSearch,
      "ZZZ",
      searchModal.group_id,
      searchModal.invent_yn
    );
  }, [dataSource, searchModal]);

  useEffect(() => {
    getListInvoice();
  }, []);

  useEffect(() => {
    if(Object.keys(dataProductBarCode).length){
      handleShowModalPrice(dataProductBarCode);
    }
  }, [dataProductBarCode])
  //-- xử lý khi timeout -> ko nhận được phản hồi từ server

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
  const getListInvoice = () => {
    const inputParam = [
      moment().format("YYYYMMDD"),
      moment().format("YYYYMMDD"),
      999999999999,
      "1",
      "%%",
    ];
    sendRequest(
      serviceInfo.GET_ALL_LIST_INVOICE,
      inputParam,
      handleResultGetAllListInvoice,
      true,
      handleTimeOut
    );
  };

  const handleResultGetAllListInvoice = (reqInfoMap, message) => {
    if (message["PROC_STATUS"] !== 1) {
      // xử lý thất bại
      handleCallApiFail(reqInfoMap, message);
    } else if (message["PROC_DATA"]) {
      // xử lý thành công
      let newData = message["PROC_DATA"];
      setDataHistoryListInvoice(newData.rows);
    }
  };

  const getList = (last_product_id, last_lot_no_id, group_id, invent_yn) => {
    // setSearchProcess(true);
    const inputParam = [
      last_product_id || glb_sv.defaultValueSearch,
      last_lot_no_id || "ZZZ",
      group_id,
      invent_yn,
    ];
    sendRequest(
      serviceInfo.GET_ALL,
      inputParam,
      handleResultGetAll,
      true,
      handleTimeOut
    );
  };

  const handleResultGetAll = (reqInfoMap, message) => {
    // setSearchProcess(false);
    if (message["PROC_STATUS"] !== 1) {
      // xử lý thất bại
      handleCallApiFail(reqInfoMap, message);
    } else if (message["PROC_DATA"]) {
      let newData = message["PROC_DATA"];
      if (newData.rows.length > 0) {
        dataSourceRef.current = dataSourceRef.current.concat(newData.rows);
        setListInventory(dataSourceRef.current);
        if (
          reqInfoMap.inputParam[0] === glb_sv.defaultValueSearch &&
          reqInfoMap.inputParam[1] === "ZZZ"
        ) {
          setTotalRecords(newData.rowTotal);
        } else {
          setTotalRecords(
            dataSourceRef.current.length -
              newData.rows.length +
              newData.rowTotal
          );
        }
      } else {
        dataSourceRef.current = [];
        setListInventory([]);
        setTotalRecords(0);
      }
    }
  };

  const debouncedSave = useCallback(
    debounce((value) => {
      const inputParam = [`${value}%`, "Y"];
      sendRequest(
        serviceInfo.SEARCH_INVEN_PROD,
        inputParam,
        handleResultSearchInput,
        true,
        handleTimeOut
      );
    }, 100),
    []
  );

  const handleFocus = (event) => event.target.select();

  const handleSearchInput = (e) => {
    if (e.target.value === "") {
      setTimeout(() => {
        setListInventoryProduct([]);
        setDataSearchInput("");
      }, 200);
      return;
    }
    setDataSearchInput(e.target.value);
    debouncedSave(e.target.value);
  };

  const handleBarcode = (e) => {
    debouncedSaveBarCode(e.target.value);
  };

  const debouncedSaveBarCode = useCallback(
    debounce((valueBarCode) => {
      if (!!valueBarCode) {
      setBarCode(valueBarCode)
      const inputParam = [valueBarCode, "Y"];
      sendRequest(
        serviceInfo.SEARCH_INVEN_PROD,
        inputParam,
        handleResultSearchBarcode,
        true,
        handleTimeOut
      );
      // e.target.value = "";
    }
    }, 200),
    []
  );

  const handleResultSearchBarcode = (reqInfoMap, message) => {
    if (message["PROC_STATUS"] !== 1) {
      // xử lý thất bại
      handleCallApiFail(reqInfoMap, message);
    } else if (message["PROC_DATA"] && message["PROC_DATA"].rows.length) {
      setBarCode('')
      setDataProductBarCode(message["PROC_DATA"].rows[0])
    }else{
      setBarCode('')
      SnackBarService.alert(t("Sản phẩm trong kho đã hết hoặc mã code chưa đúng"), true, 4, 3000);
    }
  };
console.log(dataProductBarCode);
  const typePrice = (typeCheck, retailPrice, wholesalePrice) => {
    return typeCheck ? retailPrice : wholesalePrice;
  };

  const handleResultSearchInput = (reqInfoMap, message) => {
    if (message["PROC_STATUS"] !== 1) {
      // xử lý thất bại
      handleCallApiFail(reqInfoMap, message);
    } else if (message["PROC_DATA"]) {
      setListInventoryProduct(message["PROC_DATA"].rows);
      // xử lý thành công
    }
  };

  const handleTimeOut = (e) => {
    SnackBarService.alert(t(`message.${e.type}`), true, 4, 3000);
  };
  // Thêm sản phẩm
  const handleAddProduce = () => {
    setListInventoryProduct([]);
    setDataSearchInput("");
    console.log(Export)
    if (!Export.customer || !Export.order_dt) {
      SnackBarService.alert(t("message.requireExportInvoice"), true, 4, 3000);
      return;
    } else if (!invoiceFlag) {
      handleCreateInvoice();
      return;
    } else {
      const inputParam = [
        newInvoiceId.current,
        typeSale, // Loại hình xuất ‘1’ – xuất bán, ‘2’ – Hàng khuyến mãi
        dataWaitAdd.current.o_1, // ID sản phẩm nhập
        dataWaitAdd.current.o_3, // Số lô
        1, // Số lượng xuất
        dataWaitAdd.current.o_11, // Id đơn vị tính
        typePrice(
          invoiceType,
          dataWaitAdd.current.o_13,
          dataWaitAdd.current.o_14
        ) || expPrice, // Giá bán
        0, // Phần trăm chiết khấu
        0, // Phần trăm VAT
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

  const handleResultAddProductToInvoice = (reqInfoMap, message) => {
    SnackBarService.alert(
      message["PROC_MESSAGE"],
      true,
      message["PROC_STATUS"],
      3000
    );
    if (message["PROC_STATUS"] !== 1) {
      // xử lý thất bại
      handleCallApiFail(reqInfoMap, message);
    } else if (message["PROC_DATA"]) {
      dataWaitAdd.current = {};
      setIsIndexRow(null);
      handleRefresh();
      // xử lý thành công
    }
  };
  const handleChangeBill = (e) => {
    const newExport = { ...Export };
    newExport[e.target.name] = e.target.value;
    setExport(newExport);
  };

  const handleDateChange = (date) => {
    const newExport = { ...Export };
    newExport["order_dt"] = date;
    setExport(newExport);
  };

  const handleSelectCustomer = (obj) => {
    const newExport = { ...Export };
    newExport["customer"] = !!obj ? obj?.o_1 : null;
    setCustomerSelect(!!obj ? obj?.o_2 : "");
    setExport(newExport);
  };

  const handleAmountChange = (value) => {
    const newExport = { ...Export };
    newExport["payment_amount"] = Number(value.value);
    setExport(newExport);
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
      handleCallApiFail(reqInfoMap, message);
    } else if (message["PROC_DATA"]) {
      // xử lý thành công
      let newData = message["PROC_DATA"];

      if (!!newData.rows[0].o_1) {
        newInvoiceId.current = newData.rows[0].o_1;
        setInvoiceFlag(true); // Tạo hóa đơn thành công
        sendRequest(
          serviceInfo.GET_INVOICE_BY_ID,
          [newInvoiceId.current],
          handleResultGetInvoiceByID,
          true,
          handleTimeOut
        );

        if (Object.keys(dataWaitAdd.current).length != 0) {
          const inputParam = [
            newData.rows[0].o_1 || newInvoiceId.current,
            typeSale, // Loại hình xuất ‘1’ – xuất bán, ‘2’ – Hàng khuyến mãi
            dataWaitAdd.current.o_1, // ID sản phẩm nhập
            dataWaitAdd.current.o_3, // Số lô
            1, // Số lượng xuất
            dataWaitAdd.current.o_11, // Id đơn vị tính
            typePrice(
              invoiceType,
              dataWaitAdd.current.o_13,
              dataWaitAdd.current.o_14
            ) || expPrice, // Giá bán
            // dataWaitAdd.current.o_13 || expPrice, // Giá bán
            0, // Phần trăm chiết khấu (0 default)
            0, // Phần trăm VAT (0 default)
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
    dataProduct.current = null
  };

  const handleGetAllProductByInvoiceID = (reqInfoMap, message) => {
    if (message["PROC_STATUS"] !== 1) {
      // xử lý thất bại
      handleCallApiFail(reqInfoMap, message);
    } else if (message["PROC_DATA"]) {
      // xử lý thành công
      let newData = message["PROC_DATA"];
      setDataSource(newData.rows);
    }
  };

  const handleResultGetInvoiceByID = (reqInfoMap, message) => {
    if (message["PROC_STATUS"] !== 1) {
      // xử lý thất bại
      handleCallApiFail(reqInfoMap, message);
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
      // list hóa đơn
      setCustomerSelect(newData.rows[0].o_5);
      setExport(dataExport);
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
    SnackBarService.alert(
      message["PROC_MESSAGE"],
      true,
      message["PROC_STATUS"],
      3000
    );
    if (message["PROC_STATUS"] !== 1) {
      // xử lý thất bại
      handleCallApiFail(reqInfoMap, message);
    } else if (message["PROC_DATA"]) {
      handleRefresh();
      setIsIndexRow(null);
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
      newProductInfo["expPrice"] = item.o_10;
      newProductInfo["expDisCount"] = item.o_11;
      newProductInfo["expVAT"] = item.o_12;
      setProductInfo(newProductInfo);
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
      handleCallApiFail(reqInfoMap, message);
    } else if (message["PROC_DATA"]) {
      // xử lý thành công
      setProductDeleteIndex(null);
      setProductDeleteModal({});
      setShouldOpenDeleteModal(false);
      handleRefresh();
    }
  };

  const handleShowModalPrice = (dataProduct) => {
    dataWaitAdd.current = dataProduct;
    setTypeSale("1");
    if (typePrice(invoiceType, dataProduct?.o_13, dataProduct?.o_14)) {
      handleAddProduce();
      return;
    }
    setOpen(true);
    setExpPrice(0);
  };

  const handleCallApiFail = (reqInfoMap, message) => {
    const cltSeqResult = message["REQUEST_SEQ"];
    glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap);
    control_sv.clearReqInfoMapRequest(cltSeqResult);
  };
  const onChangeColumnView = (item) => {
    const newColumn = [...column];
    const index = newColumn.findIndex((obj) => obj.field === item.field);
    if (index >= 0) {
      newColumn[index]["show"] = !column[index]["show"];
      localStorage.setItem(
        `exportTableTop-${glb_sv.newVersion}`,
        JSON.stringify(newColumn)
      );
      setColumn(newColumn);
    }
  };

  const checkValidate = () => {
    if (!!Export.customer && !!Export.order_dt && invoiceFlag) {
      return false;
    }
    return true;
  };

  const handleUpdateInvoice = () => {
    if (!Export.invoice_id && !invoiceFlag) {
      handleCreateInvoice();
      return;
    } else if (!Export.customer || !Export.order_dt) {
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
      handleCallApiFail(reqInfoMap, message);
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

  const handlePrint = useReactToPrint({
    content: () => componentPrint.current,
  });

  const handleSelectGroup = (obj) => {
    if (obj) {
      const newSearchModal = { ...searchModal };
      newSearchModal["group_id"] = !!obj ? obj?.o_1 : null;
      newSearchModal["group_nm"] = !!obj ? obj?.o_2 : "";
      setSearchModal(newSearchModal);
    } else {
      setSearchModal({ ...searchDefaultModal });
    }
    dataSourceRef.current = [];
  };

  const handleChange = (e) => {
    const newSearchModal = { ...searchModal };
    newSearchModal[e.target.name] = e.target.value;
    dataSourceRef.current = [];
    setSearchModal(newSearchModal);
  };

  const handleClickEdit = (item, index) => {
    setIsIndexRow(index);
    setProductInfo({
      ...productInfo,
      expType: item.o_2,
      expQty: item.o_7,
      expPrice: item.o_10,
      expDisCount: item.o_11,
      expVAT: item.o_12,
    });
  };

  const getNextData = () => {
    const lastIndex = dataSourceRef.current.length - 1;
    const lastProdId = dataSourceRef.current[lastIndex].o_1;
    const lastLotNoId = dataSourceRef.current[lastIndex].o_3;
    getList(
      lastProdId,
      lastLotNoId,
      searchModal.group_id,
      searchModal.invent_yn
    );
  };

  const showIconSort = () => {

    switch (sortColumn?.status) {
      case "DSC":
        return <ExpandLessIcon/>
      case "DESC":
        return <KeyboardArrowDownIcon/>
      default:
        return null
    }
  };

  const handleClickSortColum = (col,index) =>{
    let sortData
    if (sortColumn?.status === 'DESC') {
      sortData = sortBy(dataSource, [col.field],'DESC');
      setSortColumn({columIndex: index, status: 'DSC'})
    } else {
      sortData = sortBy(dataSource, [col.field]).reverse();
      setSortColumn({columIndex: index, status: 'DESC'})
    }
    setDataSource(sortData);
  }
  return (
    <>
      <Modal
        setOpen={setOpen}
        open={open}
        typeSale={typeSale}
        setTypeSale={setTypeSale}
        expPrice={expPrice}
        setExpPrice={setExpPrice}
        handleAddProduce={handleAddProduce}
      />
      <div
        className={`${
          (listInventoryProduct.length || openModalShowBill) && "full-screen"
        }`}
        onClick={() => {
          setDataSearchInput("");
          setListInventoryProduct([]);
          setOpenModalShowBill(false);
        }}
      ></div>
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
        <List style={{ minWidth: "270px", overflowY: "scroll" }}>
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
                    setIsIndexRow(null);
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
                          : {glb_sv.formatValue(data.o_12, "currency")}
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
                          {moment(data.o_17, "DDMMYYYYHHmmss").format(
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
        </List>
      </Drawer>
      <Grid container spacing={1} className="h-100">
        <Grid item md={9} xs={12} className="h-100">
          <Card className="mb-2" style={{ height: "53%" }}>
            <CardHeader
              title={
                <div className="flex aligh-item-center">{<Breadcrumb />}</div>
              }
            />
            <CardContent>
              <div className="flex justify-content-between aligh-item-center">
                <div className="mb-1 flex aligh-item-center">
                  {isScan ? (
                    <div id="search-product">
                      <TextField
                        style={{ width: "300px" }}
                        size={"small"}
                        label={t("search_btn")}
                        variant="outlined"
                        onChange={handleSearchInput}
                        value={dataSearchInput}
                      />
                      <List
                        className={`list-product-inventory ${
                          !listInventoryProduct.length && "dl-none"
                        }`}
                      >
                        {listInventoryProduct.map((data, index) => {
                          return (
                            <>
                              <ListItem
                                button
                                className="cursor-pointer w-100"
                                key={index}
                                onClick={() => {
                                  handleShowModalPrice(data);
                                  setDataSearchInput("");
                                  setListInventoryProduct([]);
                                  setOpenModalShowBill(false);
                                }}
                              >
                                <Avatar
                                  className="custom-avatar"
                                  variant="square"
                                  src={`${glb_sv.configInfo.domain}/upload/product/${data.o_10}`}
                                >
                                  <TextImage />
                                </Avatar>
                                <div className="w-100">
                                  <div className="fz12">
                                    <div className="fz14 font-weight-500">
                                      {data.o_2}
                                    </div>
                                    <div className="flex justify-content-between">
                                      <div>
                                        {t("order.export.lot_no")}: {data.o_3}
                                      </div>
                                      <div>
                                        {t("order.export.HSD")}:{" "}
                                        {moment(data.o_4, "YYYYMMDD").format(
                                          "DD/MM/YYYY"
                                        )}
                                      </div>
                                    </div>
                                    <div>
                                      <div>
                                        {t("order.export.inven")}: {data.o_5}
                                      </div>
                                      <div>
                                        {typePrice(
                                          invoiceType,
                                          data?.o_13,
                                          data?.o_14
                                        )
                                          ? `${t(
                                              "order.export.price"
                                            )}: ${glb_sv.formatValue(
                                              typePrice(
                                                invoiceType,
                                                data?.o_13,
                                                data?.o_14
                                              ),
                                              "currency"
                                            )}`
                                          : t(
                                              "order.export.selling_price_has_not_been_set"
                                            )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </ListItem>
                              <Divider component="li" />
                            </>
                          );
                        })}
                      </List>
                    </div>
                  ) : (
                    <TextField
                      style={{ width: "300px" }}
                      size={"small"}
                      label={t("product.barcode")}
                      variant="outlined"
                      autoFocus={true}
                      value={barCode}
                      onChange={handleBarcode}
                    />
                  )}
                  <span className="ml-2 p-1 action_ctr">
                    {isScan ? (
                      <Tooltip
                        onClick={() => {
                          setIsScan(false);
                        }}
                        title={t("scan_barcode")}
                      >
                        <IC_ADD_BASIC />
                      </Tooltip>
                    ) : (
                      <Tooltip
                        onClick={() => {
                          setIsScan(true);
                        }}
                        title={t("edit_base")}
                      >
                        <SearchIcon />
                      </Tooltip>
                    )}
                  </span>
                </div>
                <div>
                  <ExportExcel
                    filename={`export_${Export.invoice_no}`}
                    data={dataCSV()}
                    headers={headersCSV}
                    style={{ backgroundColor: "#00A248", color: "#066190" }}
                  />
                  {/* <ImportExcel1
                    // title={'title'}
                  /> */}
                  <DisplayColumn
                    style={{ backgroundColor: "#066190", color: "#fff" }}
                    columns={column}
                    handleCheckChange={onChangeColumnView}
                  />
                </div>
              </div>
              <TableContainer className="export tableContainer tableOrder">
                <Table stickyHeader>
                  <caption
                    className={[
                      "text-center text-danger border-bottom-0",
                      dataSource.length > 0 ? "d-none" : "",
                    ].join(" ")}
                  >
                    {t("lbl.emptyData")}
                  </caption>
                  <TableHead>
                    <TableRow>
                      {column.map((col,index) => {
                        return (
                          <Tooltip
                            placement="top"
                            disableFocusListener
                            disableTouchListener
                            title={t(col.tootip)}
                          >
                            <TableCell
                              colSpan={col.field === "action" ? 2 : 1}
                              nowrap="true"
                              align={col.align}
                              className={[
                                "p-2 border-0 cursor-pointer",
                                col.show ? "d-table-cell" : "d-none",
                              ].join(" ")}
                              key={col.field}
                              onClick={() =>{
                                handleClickSortColum(col,index)
                              }}
                            >
                              {t(col.title)}{" "}{(sortColumn?.columIndex === index) && showIconSort()}
                            </TableCell>
                          </Tooltip>
                        );
                      })}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dataSource.map((item, index) => {
                      return (
                        <TableRow
                          hover
                          role="checkbox"
                          tabIndex={-1}
                          key={index}
                          onDoubleClick={() => {
                            handleClickEdit(item, index);
                          }}
                        >
                          {column.map((col, indexRow) => {
                            let value = item[col.field];
                            if (col.show) {
                              switch (col.field) {
                                case "action":
                                  return (
                                    <>
                                      <TableCell align="center" nowrap="true">
                                        {isIndexRow === index ? (
                                          <Tooltip
                                            placement="top"
                                            title={t("save")}
                                          >
                                            <IconButton
                                              size="small"
                                              onClick={() => {
                                                updateDataListProduct(item);
                                              }}
                                            >
                                              <SaveIcon
                                                style={{ color: "#066190" }}
                                                fontSize="midlle"
                                              />
                                            </IconButton>
                                          </Tooltip>
                                        ) : (
                                          <Tooltip
                                            placement="top"
                                            title={t("delete")}
                                          >
                                            <IconButton
                                              size="small"
                                              onClick={() => {
                                                onRemove(item);
                                                setProductDeleteIndex(
                                                  index + 1
                                                );
                                              }}
                                            >
                                              <DeleteIcon
                                                style={{ color: "red" }}
                                                fontSize="middle"
                                              />
                                            </IconButton>
                                          </Tooltip>
                                        )}
                                      </TableCell>

                                      <TableCell align="center" nowrap="true">
                                        {isIndexRow === index ? (
                                          <Tooltip
                                            placement="top"
                                            title={t("cancel")}
                                          >
                                            <IconButton
                                              size="small"
                                              onClick={() => {
                                                setIsIndexRow(null);
                                              }}
                                            >
                                              <CancelIcon
                                                style={{ color: "#732424" }}
                                                fontSize="midlle"
                                              />
                                            </IconButton>
                                          </Tooltip>
                                        ) : (
                                          <>
                                            <Tooltip
                                              placement="top"
                                              title={t("update")}
                                            >
                                              <IconButton
                                                size="small"
                                                onClick={() => {
                                                  handleClickEdit(item, index);
                                                }}
                                              >
                                                <BorderColorIcon fontSize="midlle" />
                                              </IconButton>
                                            </Tooltip>
                                          </>
                                        )}
                                      </TableCell>
                                    </>
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
                                case "o_3":
                                  return (
                                    <TableCell align="center" nowrap="true">
                                      {isIndexRow === index ? (
                                        <Select
                                          id="outlined-margin-dense"
                                          margin="dense"
                                          fullWidth={true}
                                          labelId="export_type"
                                          name="expType"
                                          value={productInfo.expType}
                                          onChange={(event) => {
                                            handleChangeType(event, item);
                                          }}
                                          variant="outlined"
                                        >
                                          <MenuItem value="1">
                                            {t("order.export.export_type_buy")}
                                          </MenuItem>
                                          <MenuItem value="2">
                                            {t(
                                              "order.export.export_type_selloff"
                                            )}
                                          </MenuItem>
                                        </Select>
                                      ) : (
                                        item.o_3
                                      )}
                                    </TableCell>
                                  );
                                case "o_14":
                                  return (
                                    <TableCell align="center" nowrap="true">
                                      {moment(item.o_14, "DDMMYYYY").format(
                                        "DD/MM/YYYY"
                                      )}
                                    </TableCell>
                                  );
                                case "o_7":
                                  return (
                                    <TableCell align="center" nowrap="true">
                                      {isIndexRow === index ? (
                                        <NumberFormat
                                          size={"small"}
                                          className="inputNumber"
                                          required
                                          type="teft"
                                          customInput={TextField}
                                          autoComplete="off"
                                          autoFocus={true}
                                          margin="dense"
                                          variant="outlined"
                                          onFocus={handleFocus}
                                          onKeyPress={(event) => {
                                            if (event.key === "Tab") {
                                              step2Ref.current.focus();
                                            }
                                          }}
                                          onValueChange={(value) => {
                                            handleChangeUpdate(
                                              "expQty",
                                              value.floatValue
                                            );
                                          }}
                                          value={productInfo.expQty}
                                        />
                                      ) : (
                                        item.o_7
                                      )}
                                    </TableCell>
                                  );
                              
                                  case "o_10":
                                  return (
                                    <TableCell align="center" nowrap="true">
                                      {isIndexRow === index ? (
                                        <NumberFormat
                                          inputRef={step2Ref}
                                          className="inputNumber"
                                          required
                                          customInput={TextField}
                                          autoComplete="off"
                                          margin="dense"
                                          type="text"
                                          variant="outlined"
                                          value={productInfo.expPrice}
                                          thousandSeparator={true}
                                          disabled={
                                            productInfo.expType === "1"
                                              ? false
                                              : true
                                          }
                                          onValueChange={(value) => {
                                            handleChangeUpdate(
                                              "expPrice",
                                              value.floatValue
                                            );
                                          }}
                                          onKeyPress={(event) => {
                                            if (event.key === "Tab") {
                                              step3Ref.current.focus();
                                            }
                                          }}
                                        />
                                      ) : (
                                        glb_sv.formatValue(
                                          item.o_10,
                                          col["type"]
                                        )
                                      )}
                                    </TableCell>
                                  );
                               
                                  case "o_11":
                                  return (
                                    <TableCell align="center" nowrap="true">
                                      {isIndexRow === index ? (
                                        <NumberFormat
                                          inputRef={step3Ref}
                                          className="inputNumber"
                                          required
                                          customInput={TextField}
                                          autoComplete="off"
                                          margin="dense"
                                          type="text"
                                          variant="outlined"
                                          value={productInfo.expDisCount}
                                          disabled={
                                            productInfo.expType === "1"
                                              ? false
                                              : true
                                          }
                                          onValueChange={(value) => {
                                            handleChangeUpdate(
                                              "expDisCount",
                                              value.floatValue
                                            );
                                          }}
                                          onKeyPress={(event) => {
                                            if (event.key === "Tab") {
                                              step4Ref.current.focus();
                                            }
                                          }}
                                        />
                                      ) : (
                                        item.o_11
                                      )}
                                    </TableCell>
                                  );
                                case "o_12":
                                  return (
                                    <TableCell
                                      align="center"
                                      nowrap="true"
                                      style={{ minWidth: "100px" }}
                                    >
                                      {isIndexRow === index ? (
                                        <NumberFormat
                                          inputRef={step4Ref}
                                          className="inputNumber"
                                          required
                                          customInput={TextField}
                                          autoComplete="off"
                                          margin="dense"
                                          type="text"
                                          value={productInfo.expVAT}
                                          disabled={
                                            productInfo.expType === "1"
                                              ? false
                                              : true
                                          }
                                          variant="outlined"
                                          onValueChange={(value) => {
                                            handleChangeUpdate(
                                              "expVAT",
                                              value.floatValue
                                            );
                                          }}
                                        />
                                      ) : (
                                        item.o_12
                                      )}
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
          <Card
            style={{ height: "calc(47% - 8px)" }}
            className="list-product-bottom"
          >
            <CardHeader
              title={t("product.titleList")}
              action={
                <div className="flex">
                  <div style={{ minWidth: "270px" }}>
                    <Dictionary_Autocomplete
                      placeholder={t("order.export.filter_by_product_group")}
                      diectionName="groups"
                      value={searchModal.group_nm || ""}
                      style={{
                        marginTop: 8,
                        marginBottom: 4,
                        background: "#fff",
                        borderRadius: "5px",
                        fontSize: "12px",
                      }}
                      size={"small"}
                      onSelect={handleSelectGroup}
                    />
                  </div>
                  <FormControl
                    margin="dense"
                    variant="outlined"
                    className="w-100 ml-1"
                    style={{ minWidth: "150px" }}
                  >
                    <Select
                      className="status-select"
                      labelId="status"
                      id="status-select"
                      value={searchModal.invent_yn || "Y"}
                      onChange={handleChange}
                      name="invent_yn"
                    >
                      <MenuItem value="N">{t("report.all")}</MenuItem>
                      <MenuItem value="Y">
                        {t("order.export.inventory_lot_no")}
                      </MenuItem>
                    </Select>
                  </FormControl>
                </div>
              }
            />
            <CardContent style={{ height: "calc(35vh)", overflow: "auto" }}>
              <MuiThemeProvider theme={theme}>
                <Grid container spacing={2}>
                  {listInventory.map((item, index) => {
                    return (
                      <Grid
                        item
                        xs={4}
                        md={3}
                        sm={3}
                        lg={3}
                        xl={2}
                        key={index}
                        className="custom-img"
                      >
                        <ImageListItem
                          className="cursor-pointer list-style"
                          key={index}
                          onClick={() => {
                            handleShowModalPrice(item);
                          }}
                        >
                          <Avatar
                            variant="square"
                            style={{
                              height: "150px",
                              width: "100%",
                              marginRight: "10px",
                            }}
                            src={`${glb_sv.configInfo.domain}/upload/product/${item.o_10}`}
                          >
                            <TextImage />
                          </Avatar>
                          <ImageListItemBar
                            className="show-info-bottom"
                            title={<div className="fz14">{item.o_2}</div>}
                            subtitle={
                              <div style={{ fontSize: "10px" }}>
                                <div>
                                  <span>
                                    {t("order.export.lot_no")}: {item.o_3}
                                  </span>{" "}
                                  <span className="ml-2">
                                    {t("order.export.HSD")}:{" "}
                                    {moment(item.o_4, "YYYYMMDD").format(
                                      "DD/MM/YYYY"
                                    )}
                                  </span>
                                </div>
                                <div className="mt-1">
                                  {t("order.export.inven")}: {item.o_5}
                                </div>
                              </div>
                            }
                          />
                        </ImageListItem>
                      </Grid>
                    );
                  })}
                </Grid>
              </MuiThemeProvider>
            </CardContent>

            <CardActions disableSpacing>
              <div className="d-flex align-items-center">
                <Chip
                  size="small"
                  variant="outlined"
                  className="mr-1"
                  label={
                    dataSourceRef.current.length +
                    "/" +
                    totalRecords +
                    " " +
                    t("Sản phẩm")
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
                  onClick={getNextData}
                  disabled={dataSourceRef.current.length >= totalRecords}
                />
              </div>
            </CardActions>
          </Card>
        </Grid>
        <Grid item md={3} xs={12}>
          <Card className="h-100">
            <CardHeader
              title={
                <div className="flex justify-content-between aligh-item-center">
                  <div>{t("order.export.invoice_info")}</div>{" "}
                  <div className="cursor-pointer flex">
                    <div className="mr-1">
                      <Tooltip
                        disableFocusListener
                        title={t("order.exportRepay.intraday_trans_his")}
                      >
                        <HistoryIcon
                          onClick={() => {
                            setOpenModalShowBill((pre) => !pre);
                            getListInvoice();
                          }}
                        />
                      </Tooltip>
                    </div>
                    <div className="mr-1">
                      <Tooltip
                        disableFocusListener
                        title={t("order.exportRepay.new_invoice")}
                      >
                        <AddShoppingCartIcon
                          onClick={() => {
                            setExport({ ...invoiceExportModal });
                            setDataSource([]);
                            setInvoiceFlag(false);
                            setCustomerSelect("");
                          }}
                        />
                      </Tooltip>
                    </div>
                  </div>
                </div>
              }
            />
            <CardContent>
              <Grid container>
                <FormControlLabel
                  style={{ margin: 0 }}
                  control={
                    <Switch
                      checked={invoiceType}
                      onChange={(e) => setInvoiceType(e.target.checked)}
                      inputProps={{ "aria-label": "controlled" }}
                    />
                  }
                  label={
                    <>
                      {t(
                        `${
                          invoiceType ? "retail_invoice" : "wholesale_invoice"
                        }`
                      )}
                      <Tooltip
                        title={t(
                          `${
                            invoiceType
                              ? "tooltip_retail_invoice"
                              : "tooltip_wholesale_invoice"
                          }`
                        )}
                      >
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
                    // Mã hóa đơn
                    onChange={handleChangeBill}
                    value={Export.invoice_no || ""}
                    name="invoice_no"
                    variant="outlined"
                  />
                </Tooltip>
                <div className="d-flex align-items-center w-100">
                  <CustomerAdd_Autocomplete
                    value={customerSelect || ""}
                    // autoFocus={true}
                    size={"small"}
                    label={t("menu.customer")}
                    onSelect={handleSelectCustomer}
                    onCreate={(id) =>
                      setExport({ ...Export, ...{ customer: id } })
                    }
                  />
                </div>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <KeyboardDatePicker
                    className="w-100"
                    disableToolbar
                    margin="dense"
                    variant="outlined"
                    inputVariant="outlined"
                    format="dd/MM/yyyy"
                    id="order_dt-picker-inline"
                    label={t("order.export.order_dt")}
                    value={Export.order_dt}
                    onChange={handleDateChange}
                    KeyboardButtonProps={{
                      "aria-label": "change date",
                    }}
                  />
                </MuiPickersUtilsProvider>
                <TextField
                  fullWidth={true}
                  margin="dense"
                  multiline
                  autoComplete="off"
                  rows={1}
                  label={t("order.export.note")}
                  onChange={handleChangeBill}
                  value={Export.note || ""}
                  name="note"
                  variant="outlined"
                />
                <NumberFormat
                  className="inputNumber w-100"
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
                  className="inputNumber w-100"
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
                  className="inputNumber w-100"
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
                  className="inputNumber w-100"
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
                  className="inputNumber w-100"
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
                  className="inputNumber w-100"
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
              </Grid>
              <Grid container className="mt-2">
                <Button
                  size="small"
                  style={{
                    width: "calc(60% - 0.25rem)",
                    marginRight: "0.5rem",
                  }}
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
                  {t("btn.payment2")}
                </Button>
                <Button
                  onClick={handlePrint}
                  disabled={!invoiceFlag}
                  className={invoiceFlag ? "bg-print text-white" : ""}
                  id="buttonPrint"
                  size="small"
                  variant="contained"
                  style={{ width: "calc(40% - 0.25rem)" }}
                >
                  {t("print")}
                </Button>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <div className="display-none">
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
    </>
  );
};

export default InsExport;
