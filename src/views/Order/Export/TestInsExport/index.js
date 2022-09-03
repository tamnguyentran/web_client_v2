import React, { useState, useRef, useEffect, useCallback } from "react";
import "./Export.css";
import { MuiThemeProvider, createTheme } from "@material-ui/core/styles";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import TextImage from "../../../../components/TextImage";
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
  Card,
  CardHeader,
  CardContent,
  Divider,
  MenuItem,
  ImageListItem,
  ImageListItemBar,
  ListItem,
  Avatar,
  List,
  Dialog,
  CardActions,
  Checkbox,
} from "@material-ui/core";
import LoopIcon from "@material-ui/icons/Loop";
import glb_sv from "../../../../utils/service/global_service";
import control_sv from "../../../../utils/service/control_services";
import SnackBarService from "../../../../utils/service/snackbar_service";
import reqFunction from "../../../../utils/constan/functions";
import sendRequest from "../../../../utils/service/sendReq";
import DisplayColumn from "../../../../components/DisplayColumn";
import { invoiceExportModal, tableListAddColumn2 } from "../Modal/Export.modal";
import { useReactToPrint } from "react-to-print";
import Export_Bill from "../../../../components/Bill/Export_Bill";
import ExportExcel from "../../../../components/ExportExcel";
import {
  searchDefaultModal,
  defaultDataUpdateProduct,
  searchDefaultModalInvoice,
} from "../Modal/Export.modal";
import SearchIcon from "@material-ui/icons/Search";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";

import {
  Wrapper,
  IconButtonCpn,
  ButtonCpn,
  TextFieldCpn,
  DatePickerCpn,
  SelectCpn,
} from "../../../../basicComponents";

import { Dictionary } from "../../../../components/Autocomplete";
import { ReactComponent as IC_TICK } from "../../../../asset/images/tick.svg";
import { ReactComponent as IC_PRINT } from "../../../../asset/images/print.svg";

import { ReactComponent as IC_ADD } from "../../../../asset/images/add.svg";
import { ReactComponent as IC_REDUCED } from "../../../../asset/images/reduced.svg";
import { ReactComponent as IC_ADD_BASIC } from "../../../../asset/images/add-basic.svg";

import { AddCustomer } from "../../../../components/Autocomplete";
import { number } from "prop-types";
// import { ContactlessOutlined } from "@material-ui/icons";

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
    functionName: "get_inv_dt",
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
  const history = useHistory();
  const id = history?.location?.state?.id || 0;
  const [Export, setExport] = useState({ ...invoiceExportModal });
  const [customerSelect, setCustomerSelect] = useState("");
  const [dataSource, setDataSource] = useState([]);
  const [column, setColumn] = useState([...tableListAddColumn2]);
  const [paymentInfo, setPaymentInfo] = useState({});
  const [updateProcess, setUpdateProcess] = useState(false);
  const [invoiceFlag, setInvoiceFlag] = useState(false);
  const [invoiceType, setInvoiceType] = useState(true);
  const [isScan, setIsScan] = useState(true);
  const [dataSearchInput, setDataSearchInput] = useState("");
  const [listInventoryProduct, setListInventoryProduct] = useState([]);
  const [typeSale, setTypeSale] = useState("1");
  const [expPrice, setExpPrice] = useState(0);
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
  const [dataProductBarCode, setDataProductBarCode] = useState({});
  const [productInfo, setProductInfo] = useState({
    ...defaultDataUpdateProduct,
  });

  const [sortColumn, setSortColumn] = useState({
    columIndex: null,
    status: "DESC",
  });

  const [disableUpdateInvoice, setDisableUpdateInvoice] = useState(false);

  const [searchModalInvoice, setSearchModalInvoice] = useState({
    ...searchDefaultModalInvoice,
  });
  const [totalRecordsListInvoice, setTotalRecordsListInvoice] = useState(0);


  const componentPrint = useRef(null);
  const dataWaitAdd = useRef({});
  const newInvoiceId = useRef(-1);
  const dataSourceRef = useRef([]);

  const dataProduct = useRef(null);

  const exportRef = useRef({});

  const dataHistoryListInvoiceRef = useRef([]);

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
        return acc + Math.round(obj.o_8 * obj.o_11);
      }, 0) || 0;
    newData["invoice_discount"] =
      Export.discount_tp === "1"
        ? Export.invoice_discount
        : (newData["invoice_val"] * Export.invoice_discount) / 100;
    newData["invoice_needpay"] =
      newData.invoice_val - newData.invoice_discount || 0;
    setPaymentInfo(newData);
  }, [dataSource, Export.discount_tp, Export.invoice_discount]);
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
    if (id !== 0) {
      newInvoiceId.current = id;
      handleRefresh();
      setOpenModalShowBill(false);
      setInvoiceFlag(true);
      setDisableUpdateInvoice(false);
    }
  }, []);

  useEffect(() => {
    getListInvoice(
      searchModalInvoice.start_dt,
      searchModalInvoice.end_dt,
      searchModalInvoice.last_id
    );
  }, []);

  useEffect(() => {
    if (Object.keys(dataProductBarCode).length) {
      handleShowModalPrice(dataProductBarCode);
    }
  }, [dataProductBarCode]);
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
  const getListInvoice = (start_dt, end_dt, last_id) => {
    const inputParam = [start_dt, end_dt, last_id];
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
      const inputParam = [`%${value}%`, "Y"];
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
    if (e.keyCode === 13) {
      const inputParam = [e.target.value, "Y"];
      sendRequest(
        serviceInfo.SEARCH_INVEN_PROD,
        inputParam,
        handleResultSearchBarcode,
        true,
        (e) => {
          // setDisableInputBarCode(true)
          handleTimeOut(e);
        }
      );
    }
  };

  const resetValueBarCode = () => {
    setTimeout(() => {
      document.getElementById("bar-code-id").value = "";
    }, [1000]);
  };

  const handleResultSearchBarcode = (reqInfoMap, message) => {
    if (message["PROC_STATUS"] !== 1) {
      // xử lý thất bại
      handleCallApiFail(reqInfoMap, message);
      resetValueBarCode();
    } else if (message["PROC_DATA"] && message["PROC_DATA"].rows.length) {
      setDataProductBarCode(message["PROC_DATA"].rows[0]);
      resetValueBarCode();
    } else {
      SnackBarService.alert(
        t("order.export.products_in_stock_are_out_of_stock_or_wrong_code"),
        true,
        4,
        3000
      );
      resetValueBarCode();
    }
  };
  const typePrice = (typeCheck, retailPrice, wholesalePrice) => {
    return typeCheck ? retailPrice : wholesalePrice;
  };

  const handleResultSearchInput = (reqInfoMap, message) => {
    if (message["PROC_STATUS"] !== 1) {
      handleCallApiFail(reqInfoMap, message);
    } else if (message["PROC_DATA"]) {
      setListInventoryProduct(message["PROC_DATA"].rows || []);
    }
  };

  const handleTimeOut = (e) => {
    SnackBarService.alert(t(`message.${e.type}`), true, 4, 3000);
  };
  // Thêm sản phẩm
  const handleAddProduce = () => {
    setListInventoryProduct([]);
    setDataSearchInput("");
    if (!Export.customer_id || !Export.order_dt) {
      SnackBarService.alert(
        t("Khách hàng, ngày xuất hàng là bắt buộc chọn"),
        true,
        4,
        3000
      );
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
        Number(
          typePrice(
            invoiceType,
            dataWaitAdd.current.o_13,
            dataWaitAdd.current.o_14
          ) || expPrice
        ), // Giá bán
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
      handleRefresh();
      // xử lý thành công
    }
  };
  const handleChangeBill = (e) => {
    if (e.target.name === "note") {
      if (
        exportRef.current?.note !== e.target.value ||
        exportRef.current?.customerSelect !== customerSelect
      ) {
        setDisableUpdateInvoice(true);
      } else {
        setDisableUpdateInvoice(false);
      }
    }
    const newExport = { ...Export };
    newExport[e.target.name] =
      e.target.name === "invoice_discount"
        ? Number(e.target.value)
        : e.target.value;
    setExport(newExport);
  };

  const handleDateChange = (date) => {
    const newExport = { ...Export };
    newExport["order_dt"] = date;
    setExport(newExport);
  };

  const handleSelectCustomer = (obj) => {
    const newExport = { ...Export };
    newExport["customer_id"] = !!obj ? obj?.o_1 : null;
    if (
      exportRef.current?.customerSelect !== (!!obj ? obj?.o_2 : "") ||
      exportRef.current?.note !== Export.note
    ) {
      setDisableUpdateInvoice(true);
    } else {
      setDisableUpdateInvoice(false);
    }
    setCustomerSelect(!!obj ? obj?.o_2 : "");
    setExport(newExport);
  };

  const handleAmountChange = (e) => {
    const { value, name } = e.target;
    if (value === "") return setExport((pre) => ({ ...pre, [`${name}`]: 0 }));
    setExport((pre) => ({
      ...pre,
      [`${name}`]: glb_sv.formatValue(value, "number"),
    }));
  };

  const handleCreateInvoice = () => {
    if (
      !Export.customer_id ||
      !Export.order_dt
      // !Export.invoice_discount ||
      // !Export.discount_tp
    ) {
      SnackBarService.alert(
        t("Khách hàng, ngày xuất hàng là bắt buộc chọn"),
        true,
        4,
        3000
      );
      return;
    }
    //bắn event tạo invoice
    const inputParam = [
      !!Export.invoice_no.trim() ? Export.invoice_no.trim() : "AUTO",
      Export.customer_id,
      moment(Export.order_dt).format("YYYYMMDD"),
      "",
      Export?.discount_tp || "1",
      Export?.invoice_discount || 0,
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

  const handleResultCreateInvoice = (reqInfoMap, message) => {
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
        dataHistoryListInvoiceRef.current = [];
        getListInvoice(
          searchModalInvoice.start_dt,
          searchModalInvoice.end_dt,
          searchModalInvoice.last_id
        );

        if (Object.keys(dataWaitAdd.current).length != 0) {
          const inputParam = [
            newData.rows[0].o_1 || newInvoiceId.current,
            typeSale, // Loại hình xuất ‘1’ – xuất bán, ‘2’ – Hàng khuyến mãi
            dataWaitAdd.current.o_1, // ID sản phẩm nhập
            dataWaitAdd.current.o_3, // Số lô
            1, // Số lượng xuất
            dataWaitAdd.current.o_11, // Id đơn vị tính
            Number(
              typePrice(
                invoiceType,
                dataWaitAdd.current.o_13,
                dataWaitAdd.current.o_14
              )
            ) || Number(expPrice), // Giá bán
            // dataWaitAdd.current.o_13 || expPrice, // Giá bán
            Export.invoice_discount || 0, // Phần trăm chiết khấu (0 default)
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
    dataProduct.current = null;
  };

  const handleGetAllProductByInvoiceID = (reqInfoMap, message) => {
    if (message["PROC_STATUS"] !== 1) {
      // xử lý thất bại
      handleCallApiFail(reqInfoMap, message);
      setDataSource([]);
    } else if (message["PROC_DATA"]) {
      // xử lý thành công
      let newData = message["PROC_DATA"];
      setDataSource(newData.rows || []);
      let convertData = message["PROC_DATA"].rows.map((item) => ({
        expPrice: item.o_11,
        expQty: item.o_8,
      }));
      setProductInfo(convertData);
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
        discount_tp: newData.rows[0].o_8,
        invoice_discount: newData.rows[0].o_9,
        staff_exp: newData.rows[0].o_10,
        cancel_reason: newData.rows[0].o_11,
        invoice_val: newData.rows[0].o_14,
        payment_amount: 0,
      };
      exportRef.current["note"] = newData.rows[0].o_12;
      exportRef.current["customerSelect"] = newData.rows[0].o_5;

      // list hóa đơn
      setCustomerSelect(newData.rows[0].o_5);
      setExport(dataExport);
    }
  };

  const handleResultUpdateProduct = (reqInfoMap, message) => {
    if (message["PROC_STATUS"] !== 1) {
      SnackBarService.alert(
        message["PROC_MESSAGE"],
        true,
        message["PROC_STATUS"],
        3000
      );
      handleCallApiFail(reqInfoMap, message);
      handleRefresh();
    } else if (message["PROC_DATA"]) {
      handleRefresh();
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
        item.o_2, // Mã loại hình xuất
        qty, // Số lượng
        price,
        0,
        0,
      ];
      sendRequest(
        serviceInfo.UPDATE_PRODUCT_TO_INVOICE,
        inputParam,
        handleResultUpdateProduct,
        true,
        (e) => {
          sendRequest(
            serviceInfo.GET_ALL_PRODUCT_BY_EXPORT_ID,
            [newInvoiceId.current],
            handleGetAllProductByInvoiceID,
            true,
            () => {
              setDataSource([]);
            }
          );
          handleTimeOut(e);
        }
      );
    }, 800),
    []
  );

  const handleChangeQtyProductInvoice = (type, item, index, valueQty) => {
    let tempQty = productInfo[index].expQty;
    if (type === "change") {
      setProductInfo((pre) => {
        pre[index] = { ...pre[index], expQty: valueQty };
        return [...pre];
      });
      return updateDataListProduct(valueQty, item.o_11, item);
    }
    if (type === "increase") {
      setProductInfo((pre) => {
        pre[index] = { ...pre[index], expQty: pre[index].expQty + 1 };
        return [...pre];
      });
      tempQty++;
      return updateDataListProduct(tempQty, item.o_11, item);
    } else if (productInfo[index].expQty > 1) {
      setProductInfo((pre) => {
        pre[index] = { ...pre[index], expQty: pre[index].expQty - 1 };
        return [...pre];
      });
      tempQty--;
      return updateDataListProduct(tempQty, item.o_11, item);
    }
    return updateDataListProduct(1, item.o_11, item);
  };

  const handleChangePriceProductInvoice = (type, item, index, valuePrice) => {
    let tempPrice = productInfo[index].expPrice;
    if (type === "change" && valuePrice > 0) {
      setProductInfo((pre) => {
        pre[index] = { ...pre[index], expPrice: valuePrice };
        return [...pre];
      });
      return updateDataListProduct(item.o_8, valuePrice, item);
    }
    if (type === "increase") {
      setProductInfo((pre) => {
        pre[index] = { ...pre[index], expPrice: pre[index].expPrice + 1000 };
        return [...pre];
      });
      tempPrice = tempPrice + 1000;
      return updateDataListProduct(item.o_8, tempPrice, item);
    } else if (productInfo[index].expPrice > 1000) {
      setProductInfo((pre) => {
        pre[index] = { ...pre[index], expPrice: pre[index].expPrice - 1000 };
        return [...pre];
      });
      tempPrice = tempPrice - 1000;
      return updateDataListProduct(item.o_8, tempPrice, item);
    }
    return updateDataListProduct(item.o_8, tempPrice, item);
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
    setDisableUpdateInvoice(false);
    if (typePrice(invoiceType, dataProduct?.o_13, dataProduct?.o_14)) {
      handleAddProduce();
      return;
    }
    setExpPrice(0);
  };

  const handleCallApiFail = (reqInfoMap, message) => {
    const cltSeqResult = message["REQUEST_SEQ"];
    glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap);
    control_sv.clearReqInfoMapRequest(cltSeqResult);
  };
  // const onChangeColumnView = (item) => {
  //   const newColumn = [...column];
  //   const index = newColumn.findIndex((obj) => obj.field === item.field);
  //   if (index >= 0) {
  //     newColumn[index]["show"] = !column[index]["show"];
  //     localStorage.setItem(
  //       `exportTableTop-${glb_sv.newVersion}`,
  //       JSON.stringify(newColumn)
  //     );
  //     setColumn(newColumn);
  //   }
  // };

  const checkValidate = () => {
    if (!!Export.customer_id && !!Export.order_dt && invoiceFlag) {
      return false;
    }
    return true;
  };

  const handleUpdateInvoice = () => {
    if (!Export.invoice_id && !invoiceFlag) {
      handleCreateInvoice();
      return;
    } else if (!Export.customer_id || !Export.order_dt) {
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
      // Export.staff_exp,
      "",
      Export?.discount_tp || "1",
      Export?.invoice_discount || 0,
      "",
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
      setDisableUpdateInvoice(false);
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
        return <ExpandLessIcon />;
      case "DESC":
        return <KeyboardArrowDownIcon />;
      default:
        return null;
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

  const getNextDataListInvoice = () => {
    const lastIndex = dataHistoryListInvoiceRef.current.length - 1;
    const last_id = dataHistoryListInvoiceRef.current[lastIndex].o_1;
    getListInvoice(
      searchModalInvoice.start_dt,
      searchModalInvoice.end_dt,
      last_id
    );
  };

  const handleChangeDiscount = (e) => {
    const { value, name } = e.target;
    setExport((pre) => ({ ...pre, [`${name}`]: value, invoice_discount: 0 }));
  };

  const handleChangeInvoiceDiscount = (e) => {
    const { value, name } = e.target;
    if (value === "") return setExport((pre) => ({ ...pre, [`${name}`]: 0 }));
    if (Export?.discount_tp === "1") {
      setExport((pre) => ({
        ...pre,
        [`${name}`]: glb_sv.formatValue(value, "number"),
      }));
    } else if (
      Export?.discount_tp === "2" &&
      glb_sv.formatValue(value, "number") > 0 &&
      glb_sv.formatValue(value, "number") <= 100
    ) {
      setExport((pre) => ({
        ...pre,
        [`${name}`]: glb_sv.formatValue(value, "number"),
      }));
    }
  };

  const handleCustomerId = (value) => {
    setExport((pre) => ({ ...pre, customer_id: value }));
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
              <div className="flex align-item-end">
                {isScan ? (
                  <div style={{ width: "300px" }}>
                    <TextFieldCpn
                      placeholder="Nhập tay"
                      onChange={handleSearchInput}
                      value={dataSearchInput}
                    />
                    <List
                      className={`list-product-inventory mt-2 ${
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
                                className="medium-avatar mt-1 mb-1"
                                variant="square"
                                src={`${glb_sv.configInfo.domain}/upload/product/${data.o_10}`}
                              >
                                <TextImage />
                              </Avatar>
                              <div className="w-100 ml-2">
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
                  <div style={{ width: "50%" }}>
                    <TextFieldCpn
                      id="bar-code-id"
                      style={{ width: "300px" }}
                      size={"small"}
                      variant="outlined"
                      autoFocus={true}
                      onKeyUp={handleBarcode}
                      placeholder="Vét mã vạch"
                    />
                  </div>
                )}
                <button
                  style={{
                    height: "var(--heightInput)",
                    width: "var(--heightInput)",
                    border: "1px solid var(--gray4)",
                    borderRadius: "4px",
                    paddingRight: "5px",
                    paddingBottom: "3px",
                  }}
                  className="ml-1"
                >
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
                </button>
              </div>
              <div className="mt-2 text-black fz14">
                Bạn có thể tìm kiếm bằng cách nhập tên/mã SKU hoặc nhập/quét mã
                vạch của sản phẩm
              </div>
            </div>
            <div className="flex align-item-center justify-content-end">
              <Button
                style={{
                  paddingLeft: "5px",
                  paddingRight: "7px",
                }}
                size="medium"
                className="height-btn primary-bg text-white"
                variant="contained"
                onClick={() => {
                  setExport({ ...invoiceExportModal });
                  setDataSource([]);
                  setInvoiceFlag(false);
                  setCustomerSelect("");
                }}
              >
                <IC_ADD />
                <div>H.Đ mới</div>
              </Button>
              <div
                className="flex ml-2"
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
                        setDisableUpdateInvoice(false);
                      }}
                    >
                      <div className="fz11 text-center text-black2 item-receipt">
                        {item.o_2}
                      </div>
                      <div className="fz11 text-green2 text-center">
                        {moment(item.o_11, "DDMMYYYYhhmmss").format("hh:mm:ss")}
                      </div>
                    </div>
                  );
                })}
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
            <Wrapper.WrapperTable
              style={{
                width: "calc(100% - 22% - 8px)",
                minWidth: "800px",
                border: "none",
              }}
              hiddenIcon={true}
            >
              <div className="pl-2" style={{ height: "45%" }}>
                <div
                  style={{ height: "100%", border: "1px solid var(--gray3)" }}
                >
                  <TableContainer
                    style={{
                      height: "100%",
                      overflow: "auto",
                    }}
                  >
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
                          {column.map((col, index) => {
                            return (
                              <Tooltip
                                placement="top"
                                disableFocusListener
                                disableTouchListener
                                title={t(col.tooltip)}
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
                                  onClick={() => {
                                    handleClickSortColum(col, index);
                                  }}
                                >
                                  {t(col.title)}{" "}
                                  {sortColumn?.columIndex === index &&
                                    showIconSort()}
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
                            >
                              {column.map((col, indexRow) => {
                                let value = item[col.field];
                                if (col.show) {
                                  switch (col.field) {
                                    case "action":
                                      return (
                                        <>
                                          <TableCell
                                            align="center"
                                            nowrap="true"
                                          >
                                            <IconButtonCpn.IconButtonTrash
                                              onClick={() => {
                                                onRemove(item);
                                              }}
                                            />
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
                                    case "o_6":
                                      return (
                                        <TableCell
                                          nowrap="true"
                                          key={indexRow}
                                          align={col.align}
                                        >
                                          <div>{value}</div>
                                          <div className="fz12">
                                            HSD:{" "}
                                            {glb_sv.formatDate(
                                              item.o_7,
                                              "YYYYMMDD",
                                              "DD/MM/YYYY"
                                            )}
                                          </div>
                                        </TableCell>
                                      );

                                    case "o_8":
                                      return (
                                        <TableCell
                                          nowrap="true"
                                          key={indexRow}
                                          align={col.align}
                                        >
                                          {item.o_2 === "1" ? (
                                            <div className="flex justify-content-center align-items-center">
                                              <IC_ADD
                                                className="cursor-pointer"
                                                stroke="var(--gray2)"
                                                onClick={() =>
                                                  handleChangeQtyProductInvoice(
                                                    "increase",
                                                    item,
                                                    index
                                                  )
                                                }
                                              />
                                              <input
                                                onChange={(e) =>
                                                  handleChangeQtyProductInvoice(
                                                    "change",
                                                    item,
                                                    index,
                                                    glb_sv.formatValue(
                                                      e.target.value,
                                                      "number"
                                                    )
                                                  )
                                                }
                                                className="mr-1"
                                                style={{
                                                  border: "none",
                                                  width: "30%",
                                                  textAlign: "center",
                                                  outline: "none",
                                                }}
                                                value={glb_sv.formatValue(
                                                  productInfo[index]?.expQty ||
                                                    1,
                                                  "currency"
                                                )}
                                              />
                                              <IC_REDUCED
                                                className="cursor-pointer"
                                                stroke="var(--gray2)"
                                                onClick={() =>
                                                  handleChangeQtyProductInvoice(
                                                    "reduced",
                                                    item,
                                                    index
                                                  )
                                                }
                                              />
                                            </div>
                                          ) : (
                                            glb_sv.formatValue(
                                              value,
                                              "currency"
                                            )
                                          )}
                                        </TableCell>
                                      );

                                    case "o_11":
                                      return (
                                        <TableCell
                                          nowrap="true"
                                          key={indexRow}
                                          align={col.align}
                                        >
                                          {item.o_2 === "1" ? (
                                            <div className="flex justify-content-center align-items-center">
                                              <IC_ADD
                                                className="cursor-pointer"
                                                stroke="var(--gray2)"
                                                onClick={() =>
                                                  handleChangePriceProductInvoice(
                                                    "increase",
                                                    item,
                                                    index
                                                  )
                                                }
                                              />
                                              <input
                                                onChange={(e) =>
                                                  handleChangePriceProductInvoice(
                                                    "change",
                                                    item,
                                                    index,
                                                    glb_sv.formatValue(
                                                      e.target.value,
                                                      "number"
                                                    )
                                                  )
                                                }
                                                className="mr-1 border-none text-center outline-none"
                                                style={{
                                                  width: "30%",
                                                }}
                                                value={glb_sv.formatValue(
                                                  productInfo[index]
                                                    ?.expPrice || 1,
                                                  "currency"
                                                )}
                                              />
                                              <IC_REDUCED
                                                className="cursor-pointer"
                                                stroke="var(--gray2)"
                                                onClick={() =>
                                                  handleChangePriceProductInvoice(
                                                    "reduced",
                                                    item,
                                                    index
                                                  )
                                                }
                                              />
                                            </div>
                                          ) : (
                                            glb_sv.formatValue(
                                              value,
                                              "currency"
                                            )
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
                                          {glb_sv.formatValue(
                                            value,
                                            col["type"]
                                          )}
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
                </div>
              </div>

              <div className="pl-2 pt-2" style={{ height: "55%" }}>
                <div style={{ border: "1px solid var(--gray3)" }}>
                  <div
                    style={{ borderBottom: "1px solid var(--gray3)" }}
                    className="p-2 flex justify-content-end"
                  >
                    <div style={{ minWidth: "250px" }}>
                      <Dictionary
                        placeholder={t("Nhóm sản phẩm")}
                        directionName="groups"
                        value={searchModal.group_nm || ""}
                        onSelect={handleSelectGroup}
                      />
                    </div>
                    <div className="ml-2" style={{ minWidth: "250px" }}>
                      <SelectCpn
                        value={searchModal.invent_yn || "Y"}
                        onChange={handleChange}
                        name="invent_yn"
                      >
                        <MenuItem value="N">{t("report.all")}</MenuItem>
                        <MenuItem value="Y">
                          {t("order.export.inventory_lot_no")}
                        </MenuItem>
                      </SelectCpn>
                    </div>
                  </div>
                  <div
                    className="p-2"
                    style={{
                      overflowY: "auto",
                      overflowX: "hidden",
                      height: "calc(49vh - 150px)",
                    }}
                  >
                    <MuiThemeProvider theme={theme}>
                      <Grid container spacing={2}>
                        {listInventory.map((item, index) => {
                          return (
                            <Grid
                              item
                              xs={4}
                              md={3}
                              sm={3}
                              lg={2}
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
                                  className="export-avatar"
                                  style={{
                                    width: "100%",
                                    height: "9.375rem",
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
                  </div>
                  <div
                    style={{ borderTop: "1px solid var(--gray3)" }}
                    className="p-1 flex align-items-center"
                  >
                    <ButtonCpn.ButtonGetMoreData
                      onClick={getNextData}
                      totalRecords={totalRecords}
                      displayRecords={dataSourceRef.current.length}
                      disabled={dataSourceRef.current.length >= totalRecords}
                    />
                  </div>
                </div>
              </div>
            </Wrapper.WrapperTable>
            <Wrapper.WrapperFilter style={{ width: "22%", overflowY: "auto" }}>
              <div className="pr-2 gray3-bg align-items-center text-right">
                <Checkbox
                  className="text-green2"
                  checked={invoiceType}
                  onChange={(e) => setInvoiceType(e.target.checked)}
                />
                {invoiceType ? "H.Đ bán lẻ" : "H.Đ bán sỉ"} ?
              </div>
              <div className="p-2">
                <TextFieldCpn
                  label="Số hoá đơn"
                  placeholder="Nhập tay hoặc tự sinh"
                  disabled={invoiceFlag}
                  onChange={handleChangeBill}
                  value={Export.invoice_no || ""}
                  name="invoice_no"
                />
                <AddCustomer
                  className="mt-1"
                  value={customerSelect || ""}
                  closeIcon={() => {}}
                  size={"small"}
                  handleCustomerId={handleCustomerId}
                  label={t("Khách hàng (*)")}
                  onSelect={handleSelectCustomer}
                  onCreate={(id) =>
                    setExport({ ...Export, ...{ customer: id } })
                  }
                />
                <DatePickerCpn
                  className="mt-1"
                  label="Ngày xuất bán (*)"
                  format="dd/MM/yyyy"
                  value={Export.order_dt}
                  onChange={handleDateChange}
                  disabled={true}
                />
                <TextFieldCpn
                  align="right"
                  className="mt-1"
                  value={glb_sv.formatValue(
                    Export.invoice_val || 0,
                    "currency"
                  )}
                  label={t("Giá trị HĐ")}
                  disabled={true}
                />
                <div className="flex align-items-end mt-1">
                  <div className="mr-2 w-50">
                    <SelectCpn
                      value={Export.discount_tp}
                      onChange={handleChangeDiscount}
                      name="discount_tp"
                      label="Loại chiết khấu"
                    >
                      <MenuItem value="1">{t("Tiền mặt")}</MenuItem>
                      <MenuItem value="2">{t("% Hóa đơn")}</MenuItem>
                    </SelectCpn>
                  </div>
                  <div className="w-50">
                    <TextFieldCpn
                      value={glb_sv.formatValue(
                        Export.invoice_discount || 0,
                        "number"
                      )}
                      label={" "}
                      name="invoice_discount"
                      onChange={handleChangeInvoiceDiscount}
                      disabled={!Export?.discount_tp}
                      align="right"
                    />
                  </div>
                </div>
                <TextFieldCpn
                  align="right"
                  className="mt-1"
                  value={glb_sv.formatValue(
                    paymentInfo.invoice_needpay || 0,
                    "number"
                  )}
                  label={t("Thành tiền")}
                  disabled={true}
                />
                <TextFieldCpn
                  align="right"
                  className="mt-1"
                  value={glb_sv.formatValue(Export.payment_amount, "number")}
                  label={t("Khách trả")}
                  name="payment_amount"
                  onChange={handleAmountChange}
                />
                <TextFieldCpn
                  align="right"
                  className="mt-1"
                  label={t("Tiền thừa")}
                  value={glb_sv.formatValue(
                    Export.payment_amount - paymentInfo.invoice_needpay > 0
                      ? Export.payment_amount - paymentInfo.invoice_needpay
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
        <div className="dl-none">
          <Export_Bill
            headerModal={Export}
            detailModal={dataSource}
            componentRef={componentPrint}
            paymentInfo={paymentInfo}
          />
        </div>
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
                {productDeleteModal.o_5 +
                  " - " +
                  t("Số lượng xuất") +
                  ": " +
                  productDeleteModal.o_8 +
                  " " +
                  productDeleteModal.o_10}
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
      </div>
    </>
  );
};

export default InsExport;
