import React, { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import { useTranslation } from "react-i18next";
import moment from "moment";
import {
  Button,
  Dialog,
  CardHeader,
  CardContent,
  Card,
  CardActions,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableContainer,
  TableHead,
  Tooltip,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import SaveIcon from "@material-ui/icons/Save";
import EditIcon from "@material-ui/icons/Edit";
import InfoOutlinedIcon from "@material-ui/icons/InfoOutlined";
// import PauseCircleOutlineIcon from "@material-ui/icons/PauseCircleOutline";
// import CheckCircleOutlineIcon from "@material-ui/icons/CheckCircleOutline";
// import ErrorOutlineIcon from "@material-ui/icons/ErrorOutline";
import Alert from "@material-ui/lab/Alert";
import PublishIcon from "@material-ui/icons/Publish";
import sendRequest from "../../utils/service/sendReq";
import reqFunction from "../../utils/constan/functions";
import glb_sv from "../../utils/service/global_service";
import control_sv from "../../utils/service/control_services";
// import ProductGroup_Autocomplete from "../../views/Products/ProductGroup/Control/ProductGroup.Autocomplete";
// import UnitAdd_Autocomplete from "../../views/Config/Unit/Control/UnitAdd.Autocomplete";

import { ReactComponent as IC_DOCUMENT_FOLDER } from "../../asset/images/document-folder.svg";
import { ReactComponent as IC_DOCUMENT_DOWNLOAD_EXAMPLE } from "../../asset/images/document-download-example.svg";
import info_dec from "./info_dec.json";

import { ExcelRenderer } from "react-excel-renderer";
// import { defaultModalAdd } from "../../views/Partner/Supplier/Modal/Supplier.modal";
// import { Delete } from "@material-ui/icons";
// import NumberFormat from "react-number-format";

import ModalUpdateProduct from "./ModalUpdateProduct";

const serviceInfo = {
  CREATE_UNIT: {
    functionName: "insert",
    reqFunct: reqFunction.INS_UNIT,
    biz: "common",
    object: "units",
  },
  UNIT_DROPDOWN_LIST: {
    functionName: "drop_list",
    reqFunct: reqFunction.UNIT_DROPDOWN_LIST,
    biz: "common",
    object: "dropdown_list",
  },
  CREATE_GROUP: {
    functionName: "insert",
    reqFunct: reqFunction.PRODUCT_GROUP_ADD,
    biz: "common",
    object: "groups",
  },
  GROUP_DROPDOWN_LIST: {
    functionName: "drop_list",
    reqFunct: reqFunction.PRODUCT_GROUP_DROPDOWN_LIST,
    biz: "common",
    object: "dropdown_list",
  },
  CREATE_PRODUCT: {
    functionName: "insert_full",
    reqFunct: reqFunction.PRODUCT_ADD,
    biz: "common",
    object: "products",
  },
};

const columns = [
  // { key: 'code', title: 'product.code' },
  { key: "proctatus", title: "product.procstat" },
  { key: "name", title: "product.name", status: 1 },
  { key: "group", title: "menu.productGroup", status: 1 },
  { key: "unit", title: "product.minUnit", status: 1 },
  { key: "barcode", title: "product.barcode" },
  { key: "contents", title: "product.content" },
  { key: "designate", title: "product.designate" },
  { key: "contraind", title: "product.contraind" },
  { key: "packing", title: "product.packing" },
  { key: "dosage", title: "product.dosage" },
  { key: "manufact", title: "product.manufact" },
  { key: "interact", title: "product.interact" },
  { key: "storages", title: "product.storages" },
  { key: "effect", title: "product.effect" },
  { key: "overdose", title: "product.overdose" },
  { key: "invenqty", title: "product.store_current", type: "currency" },
  { key: "inven_price", title: "product.inven_price", type: "currency" },
  { key: "lotno", title: "order.import.lot_no" },
  { key: "expire_date", title: "order.import.exp_dt" },
  {
    key: "inven_min",
    title: "config.store_limit.minQuantity",
    type: "currency",
  },
  {
    key: "inven_max",
    title: "config.store_limit.maxQuantity",
    type: "currency",
  },
  { key: "imp_price", title: "config.price.importPrice", type: "currency" },
  { key: "imp_vat", title: "config.price.importVAT" },
  { key: "exp_price", title: "config.price.price", type: "currency" },
  { key: "exp_wprice", title: "config.price.wholePrice", type: "currency" },
  { key: "exp_vat", title: "config.price.exportVAT" },
  { key: "unit_other", title: "config.price.unit" },
  { key: "convert_rate", title: "config.unitRate.rate", type: "currency" },
  //-- Key for validate
  { key: "validate", title: "" },
  { key: "noted", title: "" },
];

const productDefaulModal = {
  proctatus: 0,
  code: "",
  name: "",
  group: "",
  groupID: null,
  unit: "",
  unitID: null,
  barcode: "",
  packing: "",
  contents: "",
  designate: "",
  contraind: "",
  dosage: "",
  manufact: "",
  interact: "",
  storages: "",
  effect: "",
  overdose: "",
  invenqty: 0,
  inven_price: 0,
  lotno: "",
  expire_date: "",
  inven_min: 0,
  inven_max: 0,
  imp_price: 0,
  imp_vat: 0,
  exp_price: 0,
  exp_wprice: 0,
  exp_vat: 0,
  unit_other: null,
  convert_rate: 0,
};

const arrKeyProduct = [
  "code",
  "name",
  "group",
  "unit",
  "barcode",
  "packing",
  "contents",
  "designate",
  "contraind",
  "dosage",
  "manufact",
  "interact",
  "storages",
  "effect",
  "overdose",
  "invenqty",
  "inven_price",
  "lotno",
  "expire_date",
  "inven_min",
  "inven_max",
  "imp_price",
  "imp_vat",
  "exp_price",
  "exp_wprice",
  "exp_vat",
  "unit_other",
  "convert_rate",
];

const ImportExcel = ({ title, onRefresh }) => {
  console.log(title);
  const { t } = useTranslation();

  const [shouldOpenModal, setShouldOpenModal] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [isError, setIsError] = useState(false);

  const [unitNotAvailable, setUnitNotAvailable] = useState([]);
  const [groupNotAvailable, setGroupNotAvailable] = useState([]);

  const [unitList, setUnitList] = useState([]);
  const [groupList, setGroupList] = useState([]);
  const [isInfoObj, setIsInfoObj] = useState({
    isInventory: false,
    isExpanded: false,
    isAddUnit: false,
    isInfoPrice: false
  });
  const [shouldOpenModalEdit, setShouldOpenModalEdit] = useState(false);
  const [editID, setEditID] = useState(null);
  const [editModal, setEditModal] = useState(productDefaulModal);
  const [fileSelected, setFileSelected] = useState("");
  const [isEnableSave, setIsEnableSave] = useState(false);

  const unitListRef = useRef([]);
  const groupListRef = useRef([]);
  const step19Ref = useRef(null);
  const lengthList = useRef(0)

  const allowFileTypes = useRef([
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
  ]);
  const dataAddExcelFaild = useRef([]);

  useEffect(() => {
    console.log("vào UNIT_DROPDOWN_LIST excel");
    sendRequest(
      serviceInfo.UNIT_DROPDOWN_LIST,
      ["units", "%"],
      resultUnitDropDownList,
      false
    );
    sendRequest(
      serviceInfo.GROUP_DROPDOWN_LIST,
      ["groups", "%"],
      resultGroupDropDownList,
      false
    );
  }, []);

  useEffect(() => {
    // Gửi event tạo các đơn vị trong file excel tải lên chưa có trên hệ thống
    if (unitNotAvailable.length > 0) {
      let i = 0;
      for (; i < unitNotAvailable.length; i++) {
        sendRequest(
          serviceInfo.CREATE_UNIT,
          [unitNotAvailable[i], ""],
          null,
          false
        );
      }
      if (i === unitNotAvailable.length) {
        // Sau khi gửi hết các thông tin => lấy lại danh sách đơn vị mới
        sendRequest(
          serviceInfo.UNIT_DROPDOWN_LIST,
          ["units", "%"],
          resultUnitDropDownList,
          false
        );
      }
    }
  }, [unitNotAvailable]);

  useEffect(() => {
    // Gửi event tạo các nhóm sp trong file excel tải lên chưa có trên hệ thống
    if (groupNotAvailable.length > 0) {
      let i = 0;
      for (; i < groupNotAvailable.length; i++) {
        sendRequest(
          serviceInfo.CREATE_GROUP,
          [groupNotAvailable[i], ""],
          null,
          false
        );
      }
      if (i === groupNotAvailable.length) {
        // Sau khi gửi hết các thông tin => lấy lại danh sách nhóm sp mới
        sendRequest(
          serviceInfo.GROUP_DROPDOWN_LIST,
          ["groups", "%"],
          resultGroupDropDownList,
          false
        );
      }
    }
  }, [groupNotAvailable]);

  useEffect(() => {
    const result = dataSource.find((item) => {
      return !(item.name && item?.unitID && item?.groupID);
    });
    setIsEnableSave(!!result);
  }, [dataSource]);
  console.log(isEnableSave);
  const checkShowMessage = (data) => {};

  const resultUnitDropDownList = (reqInfoMap, message = {}) => {
    console.log("vào get resultUnitDropDownList", message);
    setUnitNotAvailable([]);
    if (message["PROC_STATUS"] !== 1) {
      const cltSeqResult = message["REQUEST_SEQ"];
      glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap);
      control_sv.clearReqInfoMapRequest(cltSeqResult);
    } else if (message["PROC_DATA"]) {
      let newData = message["PROC_DATA"];
      unitListRef.current = newData.rows;
      setUnitList(newData.rows);
    }
  };

  const resultGroupDropDownList = (reqInfoMap, message = {}) => {
    // console.log('vào get resultGroupDropDownList', message)
    setGroupNotAvailable([]);
    if (message["PROC_STATUS"] !== 1) {
      const cltSeqResult = message["REQUEST_SEQ"];
      glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap);
      control_sv.clearReqInfoMapRequest(cltSeqResult);
    } else if (message["PROC_DATA"]) {
      let newData = message["PROC_DATA"];
      groupListRef.current = newData.rows;
      setGroupList(newData.rows);
    }
  };

  const handleShowModal = () => {
    setDataSource([]);
    setShouldOpenModal(true);
    setFileSelected("");
  };

  const handleCloseModal = () => {
    setDataSource([]);
    setShouldOpenModal(false);
    setEditModal({ ...productDefaulModal });
    setEditID(null);
  };

  const handleOk = (e) => {
    e.preventDefault();
    if (!!isError) {
      return;
    }
    // let i = 0;
    for (let i = 0; i < dataSource.length; i++) {
      const e = dataSource[i];
      const groupObject = groupListRef.current.find((x) => x.o_2 === e.group);
      const unitObject = unitListRef.current.find((x) => x.o_2 === e.unit);
      if (!e.name?.trim()) {
        // Tên sp không có => bỏ qua không gửi lên sv
        continue;
      } else if (!!e?.groupID && !!e?.unitID) {
        // Đủ thông tin tên sp, nhóm, đơn vị => gửi lên sv
        console.log(e.code)
        const inputParam = [
          e.groupID,
          !e.code || e.code.trim() === "" ? "AUTO" : e.code.trim(),
          e.name,
          e.barcode,
          e.unitID,
          e.contents || "",
          e.contraind || "",
          e.designate || "",
          e.dosage || "",
          e.interact || "",
          e.manufact || "",
          e.effect || "",
          e.overdose || "",
          e.storages || "",
          e.packing || "",

          e.invenqty || 0,
          e.lotno || "",
          e.inven_price || 0,
          e.expire_date ? moment(e.expire_date).format("YYYYMMDD") : "",

          Number(e.inven_min) || 0,
          Number(e.inven_max) || 0,

          e.imp_price || 0,
          e.imp_vat || 0,
          e.exp_price || 0,
          e.exp_wprice || 0,
          e.exp_vat || 0,

          e.unit_other_id || 0,
          Number(e.convert_rate) || 0,
        ];
        console.log(e);
        console.log(inputParam);
        sendRequest(
          serviceInfo.CREATE_PRODUCT,
          inputParam,
          (reqInfoMap, message) => {
            handleResultCreate(reqInfoMap, message, e, i);
          },
          false
        );
        continue;
      } else if (e?.groupID === null && e?.unitID === null) {
        // Thiếu thông tin cả nhóm và đơn vị tính
        if (
          !!groupObject &&
          !!groupObject?.o_1 &&
          !!unitObject &&
          !!unitObject?.o_1
        ) {
          // Hệ thống đã có các thông tin đơn vị tính và nhóm cần thiết => gửi lên
          const inputParam = [
            e.groupID,
            !e.code || e.code.trim() === "" ? "AUTO" : e.code.trim(),
            e.name,
            e.barcode,
            e.unitID,
            e.contents || "",
            e.contraind || "",
            e.designate || "",
            e.dosage || "",
            e.interact || "",
            e.manufact || "",
            e.effect || "",
            e.overdose || "",
            e.storages || "",
            e.packing || "",

            e.invenqty || 0,
            e.lotno || "",
            e.inven_price || 0,
            e.expire_date ? moment(e.expire_date).format("YYYYMMDD") : "",

            Number(e.inven_min) || 0,
            Number(e.inven_max) || 0,

            e.imp_price || 0,
            e.imp_vat || 0,
            e.exp_price || 0,
            e.exp_wprice || 0,
            e.exp_vat || 0,

            e.unit || 0,
            Number(e.convert_rate) || 0,
          ];
          sendRequest(
            serviceInfo.CREATE_PRODUCT,
            inputParam,
            handleResultCreate,
            false
          );
          continue;
        } else {
          // Hệ thống chưa có nhóm/ đơn vị tính này => bỏ qua
          continue;
        }
      } else {
        // Thiếu thông tin đơn vị tính / nhóm sp
        if (e.unitID === null) {
          // Thiếu thông tin đơn vị tính
          if (!!unitObject && !!unitObject?.o_1) {
            // Hệ thống đã có thông tin đơn vị tính => gửi lên
            const inputParam = [
              e.groupID,
              !e.code || e.code.trim() === "" ? "AUTO" : e.code.trim(),
              e.name,
              e.barcode,
              e.unitID,
              e.contents || "",
              e.contraind || "",
              e.designate || "",
              e.dosage || "",
              e.interact || "",
              e.manufact || "",
              e.effect || "",
              e.overdose || "",
              e.storages || "",
              e.packing || "",

              e.invenqty || 0,
              e.lotno || "",
              e.inven_price || 0,
              e.expire_date ? moment(e.expire_date).format("YYYYMMDD") : "",

              Number(e.inven_min) || 0,
              Number(e.inven_max) || 0,

              e.imp_price || 0,
              e.imp_vat || 0,
              e.exp_price || 0,
              e.exp_wprice || 0,
              e.exp_vat || 0,

              e.unit || 0,
              Number(e.convert_rate) || 0,
            ];
            sendRequest(
              serviceInfo.CREATE_PRODUCT,
              inputParam,
              handleResultCreate,
              false
            );
            continue;
          } else {
            // Hệ thống chưa có đơn vị tính
            continue;
          }
        } else if (e.groupID === null) {
          // Thiếu thông tin nhóm sản phẩm
          if (!!groupObject && !!groupObject?.o_1) {
            // Hệ thống đã có thông tin nhóm sản phẩm => gửi lên
            const inputParam = [
              e.groupID,
              !e.code || e.code.trim() === "" ? "AUTO" : e.code.trim(),
              e.name,
              e.barcode,
              e.unitID,
              e.contents || "",
              e.contraind || "",
              e.designate || "",
              e.dosage || "",
              e.interact || "",
              e.manufact || "",
              e.effect || "",
              e.overdose || "",
              e.storages || "",
              e.packing || "",

              e.invenqty || 0,
              e.lotno || "",
              e.inven_price || 0,
              e.expire_date ? moment(e.expire_date).format("YYYYMMDD") : "",

              Number(e.inven_min) || 0,
              Number(e.inven_max) || 0,

              e.imp_price || 0,
              e.imp_vat || 0,
              e.exp_price || 0,
              e.exp_wprice || 0,
              e.exp_vat || 0,

              e.unit || 0,
              Number(e.convert_rate) || 0,
            ];
            sendRequest(
              serviceInfo.CREATE_PRODUCT,
              inputParam,
              handleResultCreate,
              false
            );
            continue;
          } else {
            // Hệ thống chưa có thông tin nhóm sản phẩm => bỏ qua
            continue;
          }
        }
      }
    }
    // if (i === dataSource.length) {
    onRefresh();
    setGroupNotAvailable([]);
    setUnitNotAvailable([]);
    setEditID(null);
    setEditModal({ ...productDefaulModal });
    setShouldOpenModalEdit(false);
    setFileSelected("");
    //   setDataSource([]);
    //   setShouldOpenModal(false);
    // }
  };

  const handleResultCreate = (reqInfoMap, message, e, i) => {
    if (message["PROC_STATUS"] !== 1) {
      e["warning"] = message["PROC_MESSAGE"];
      dataAddExcelFaild.current.push(e);
      if (i === dataSource.length - 1) {
        setDataSource(dataAddExcelFaild.current);
        dataAddExcelFaild.current = [];
      }
    } else if (message["PROC_DATA"]) {
      if (dataSource.length === 1) {
        setDataSource([]);
        setShouldOpenModal(false);
      }
    }
  };

  const validateFile = (value) => {
    const flag = allowFileTypes.current.indexOf(value.type);
    if (flag === -1) {
      return false;
    }
    return true;
  };

  const getDataBeginRow = (file, beginRow) => {
    setIsEnableSave(false);
    ExcelRenderer(file, (err, resp) => {
      if (err) {
        console.log(err);
      } else {
        const resultList = resp.rows
          .filter((data, index) => {
            return data.length > 0 && index != 0;
          })
          .map((item) => {
            for (let i = 0; i < item.length; i++) {
              if (item[i] === undefined) {
                item[i] = null;
              }
            }
            return [...item].filter((item2, index) => index !== 0);
          });
        let arrTam = [];
        resultList.forEach((item, index) => {
          let objTam = {};
          item.forEach((x, i) => {
            objTam[arrKeyProduct[i]] = x;
            if (arrKeyProduct[i] === "unit") {
              let unitObject = unitList.find((x) => x.o_2 === objTam?.unit);
              objTam["unitID"] = !!unitObject?.o_1 ? unitObject?.o_1 : null;
            }
            if (arrKeyProduct[i] === "group") {
              const groupObject = groupList.find(
                (x) => x.o_2 === objTam?.group
              );
              console.log(groupObject, groupList);
              objTam["groupID"] = !!groupObject?.o_1 ? groupObject?.o_1 : null;
            }
            if (arrKeyProduct[i] === "unit_other") {
              let unitObject = unitList.find((x) => x.o_2 === objTam?.unit_other);
              objTam["unit_other_id"] = !!unitObject?.o_1
                ? unitObject?.o_1
                : null;
            }
          });
          arrTam.push(objTam);
        });
        lengthList.current = arrTam.length || 0
        setDataSource(arrTam || []);
      }
    });
  };

  const valiadateData = (data) => {
    // { key: 'proctatus', title: 'product.procstat' },
    // { key: 'name', title: 'product.name' },
    // { key: 'group', title: 'menu.productGroup' },
    // { key: 'unit', title: 'product.minUnit' },
    // { key: 'barcode', title: 'product.barcode' },
    // { key: 'contents', title: 'product.content' },
    // { key: 'designate', title: 'product.designate' },
    // { key: 'contraind', title: 'product.contraind' },
    // { key: 'packing', title: 'product.packing' },
    // { key: 'dosage', title: 'product.dosage' },
    // { key: 'manufact', title: 'product.manufact' },
    // { key: 'interact', title: 'product.interact' },
    // { key: 'storages', title: 'product.storages' },
    // { key: 'effect', title: 'product.effect' },
    // { key: 'overdose', title: 'product.overdose' },
    // { key: 'invenqty', title: 'product.store_current' },
    // { key: 'inven_price', title: 'product.inven_price' },
    // { key: 'lotno', title: 'order.import.lot_no' },
    // { key: 'expire_date', title: 'order.import.exp_dt' },
    // { key: 'inven_min', title: 'config.store_limit.minQuantity' },
    // { key: 'inven_max', title: 'config.store_limit.maxQuantity' },
    // { key: 'imp_price', title: 'config.price.importPrice' },
    // { key: 'imp_vat', title: 'config.price.importVAT' },
    // { key: 'exp_price', title: 'config.price.price' },
    // { key: 'exp_wprice', title: 'config.price.wholePrice' },
    // { key: 'exp_vat', title: 'config.price.exportVAT' },
    // { key: 'unit_other', title: 'config.price.unit' },
    // { key: 'convert_rate', title: 'config.unitRate.rate' },
    // //-- Key for validate
    // { key: 'validate', title: '' },
    // { key: 'noted', title: '' }
    let i = 0,
      newDat = [];
    for (i = 0; i < data.length; i++) {
      const item = data[i];
      const newItem = {};
      columns.map((col) => {
        newItem["noted"] = "";
        newItem["validate"] = true;
        if (col.key === "name") {
          if (!item[col.key] || item[col.key].Trim() === "") {
            newItem["validate"] = false;
            newItem["noted"] =
              newItem["noted"].length > 0
                ? newItem["noted"] + ", " + t("imp_excel.no_prduct_info")
                : t("imp_excel.no_prduct_info");
          } else {
            newItem["name"] = item[col.key].toUpperCase();
          }
        }
        if (col.key === "group") {
          if (!item[col.key] || item[col.key].Trim() === "") {
            item["validate"] = false;
            item["noted"] =
              item["noted"].length > 0
                ? item["noted"] + ", " + t("imp_excel.no_prduct_group")
                : t("imp_excel.no_prduct_group");
          } else {
            const findInd = info_dec.groups.findIndex(
              (item) => item.name === item[col.key]
            );
            if (findInd < 0) {
              item["validate"] = false;
              item["noted"] =
                item["noted"].length > 0
                  ? item["noted"] + ", " + t("imp_excel.prduct_group_uncorrect")
                  : t("imp_excel.prduct_group_uncorrect");
            }
          }
        }
        if (col.key === "unit") {
          if (!item[col.key] || item[col.key].Trim() === "") {
            item["validate"] = false;
            item["noted"] =
              item["noted"].length > 0
                ? item["noted"] + ", " + t("imp_excel.no_unit_min_info")
                : t("imp_excel.no_unit_min_info");
          } else {
            const findInd = info_dec.units.findIndex(
              (item) => item.name === item[col.key]
            );
            if (findInd < 0) {
              item["validate"] = false;
              item["noted"] =
                item["noted"].length > 0
                  ? item["noted"] +
                    ", " +
                    t("imp_excel.unit_min_info_uncorrect")
                  : t("imp_excel.unit_min_info_uncorrect");
            }
          }
        }
        if (col.key === "invenqty") {
          if (
            !!item[col.key] &&
            (isNaN(item[col.key]) || Number(item[col.key]) < 0)
          ) {
            item["validate"] = false;
            item["noted"] =
              item["noted"].length > 0
                ? item["noted"] + ", " + t("imp_excel.inven_qty_uncorrect")
                : t("imp_excel.inven_qty_uncorrect");
          }
        }
        if (col.key === "inven_price") {
          if (
            !!item[col.key] &&
            (isNaN(item[col.key]) || Number(item[col.key]) < 0)
          ) {
            item["validate"] = false;
            item["noted"] =
              item["noted"].length > 0
                ? item["noted"] + ", " + t("imp_excel.import_price_uncorrect")
                : t("imp_excel.import_price_uncorrect");
          }
        }
        if (col.key === "lotno") {
          if (!!item[col.key] || item[col.key].Trim() === "") {
            item["validate"] = false;
            item["noted"] =
              item["noted"].length > 0
                ? item["noted"] + ", " + t("imp_excel.lotno_is_require")
                : t("imp_excel.lotno_is_require");
          }
        }
        if (col.key === "expire_date") {
          if (!!item[col.key] || item[col.key].Trim() === "") {
            if (
              info_dec.groups.findIndex(
                (item) => item["group"] === "DƯỢC PHẨM"
              ) > 0 ||
              info_dec.groups.findIndex(
                (item) => item["group"] === "THỰC PHẨM CHỨC NĂNG"
              ) > 0
            ) {
              item["validate"] = false;
              item["noted"] =
                item["noted"].length > 0
                  ? item["noted"] + ", " + t("imp_excel.expire_date_is_require")
                  : t("imp_excel.expire_date_is_require");
            }
          } else {
            let exp_dt = item[col.key].Trim(); // 12/11/2021
            let arrDt = (exp_dt = exp_dt.split("/"));
            if (
              !arrDt ||
              arrDt.length !== 3 ||
              !glb_sv.verifyDt(arrDt[0], arrDt[1], arrDt[2])
            ) {
              item["validate"] = false;
              item["noted"] =
                item["noted"].length > 0
                  ? item["noted"] + ", " + t("imp_excel.expire_date_uncorect")
                  : t("imp_excel.expire_date_uncorect");
            }
          }
        }
        if (col.key === "inven_min") {
          if (!!item[col.key] && isNaN(item[col.key])) {
            item["validate"] = false;
            item["noted"] =
              item["noted"].length > 0
                ? item["noted"] + ", " + t("imp_excel.inven_min_qty_uncorect")
                : t("imp_excel.inven_min_qty_uncorect");
          }
        }
        if (col.key === "inven_max") {
          if (!!item[col.key] && isNaN(item[col.key])) {
            item["validate"] = false;
            item["noted"] =
              item["noted"].length > 0
                ? item["noted"] + ", " + t("imp_excel.inven_max_qty_uncorect")
                : t("imp_excel.inven_max_qty_uncorect");
          } else if (
            !!item["inven_min"] &&
            !isNaN(item["inven_min"]) &&
            !!item["inven_max"] &&
            !isNaN(item["inven_max"]) &&
            Number(item["inven_min"]) > 0 &&
            Number(item["inven_max"]) > 0 &&
            Number(item["inven_min"]) >= Number(item["inven_max"])
          ) {
            item["validate"] = false;
            item["noted"] =
              item["noted"].length > 0
                ? item["noted"] + ", " + t("imp_excel.inven_min_qty_uncorect2")
                : t("imp_excel.inven_min_qty_uncorect2");
          }
        }
        if (col.key === "importPrice") {
          if (
            !!item[col.key] &&
            (isNaN(item[col.key]) || Number(item[col.key]) < 0)
          ) {
            item["validate"] = false;
            item["noted"] =
              item["noted"].length > 0
                ? item["noted"] + ", " + t("imp_excel.import_price_uncorect")
                : t("imp_excel.import_price_uncorect");
          }
        }
      });
    }
  };

  const handleImportChange = (e) => {
    setDataSource([]);
    setFileSelected("");
    const { files } = e.target;
    if (files.length === 1) {
      // Process a file if we have exactly one
      if (validateFile(files[0]) === true) {
        getDataBeginRow(files[0], 2);
        setFileSelected(files[0].name);
        setIsError(false);
      } else {
        setFileSelected("");
        setIsError(true);
      }
    }
  };

  const handleEditRow = (data, index) => {
    setEditID(index);
    setEditModal(data);
    setShouldOpenModalEdit(true);
  };

  // const handleChange = (e) => {
  //   const newModal = { ...editModal };
  //   newModal[e.target.name] =
  //     (e.target.name === "name" || e.target.code === "name") ? e.target.value.toUpperCase() : e.target.value;
  //   setEditModal({...newModal});
  // };

  // const handleValueChange = (name,value)=>{
  //   const newModal = { ...editModal };
  //   if(name === "imp_vat" || name === "exp_vat"){
  //     newModal[name] = (value < 0 || value > 100) ? 10 : value
  //   }if(name === "convert_rate"){
  //     console.log("vsvsss")
  //     newModal[name] = (value < 2) ? 2 : value
  //   }
  //   else{
  //     newModal[name] = value
  //   }
  //   setEditModal({...newModal});
  // };
  

  // const handleChangeShowDropdownInfoProduct = (keyShow) => {
  //   switch (keyShow) {
  //     case "infoExpanded":
  //       setIsInfoObj({ ...isInfoObj, isExpanded: !isInfoObj.isExpanded });
  //       break;
  //     case "infoInventory":
  //       console.log();
  //       setIsInfoObj({ ...isInfoObj, isInventory: !isInfoObj.isInventory });
  //       break;
  //     case "infoPrice":
  //       setIsInfoObj({ ...isInfoObj, isInfoPrice: !isInfoObj.isInfoPrice });
  //       break;
  //     case "infoAddUnit":
  //       setIsInfoObj({ ...isInfoObj, isAddUnit: !isInfoObj.isAddUnit });
  //       break;
  //   }
  // };

  const handleSelectProductGroup = (obj) => {
    console.log(obj)
    const newModal = { ...editModal };
    newModal["groupID"] = !!obj ? obj?.o_1 : null;
    newModal["group"] = !!obj ? obj?.o_2 : "";
    setEditModal(newModal);
  };

  const handleSelectUnit = (obj) => {
    const newModal = { ...editModal };
    newModal["unitID"] = !!obj ? obj?.o_1 : null;
    newModal["unit"] = !!obj ? obj?.o_2 : "";
    setEditModal(newModal);
  };

  const handleUpdateRow = () => {
    if (
      (editModal.groupID === 19 || editModal.groupID === 20) &&
      editModal.expire_date === "" || (editModal.inven_max < editModal.inven_min) || editModal.convert_rate < 1
    ) {
      step19Ref.current.focus();
    } else {
      let newDataSource = JSON.parse(JSON.stringify(dataSource));
      newDataSource.splice(editID, 1, editModal);
      setDataSource(newDataSource);
      setEditID(null);
      setEditModal({ ...productDefaulModal });
      setShouldOpenModalEdit(false);
    }
  };

  return (
    <>
      <Button
        size="small"
        variant="outlined"
        startIcon={<PublishIcon />}
        onClick={handleShowModal}
        style={{
          color: "var(--white)",
          border: "1px solid white",
          maxHeight: 22,
        }}
      >
        {t("product.import_excel")}
      </Button>

      <Dialog fullWidth={true} maxWidth="md" open={shouldOpenModal}>
        <Card className="product-card">
          <CardHeader
            title={title ? title : t("product.import_product_from_excel")}
            action={
              <div className="d-flex align-items-center">
                <Button
                  size="small"
                  variant="outlined"
                  // className="bg-print text-white"
                  style={{
                    color: "var(--white)",
                    border: "1px solid white",
                    maxHeight: 22,
                  }}
                  onClick={() =>
                    window.open(
                      window.location.origin +
                        "/asset/files/product_" +
                        glb_sv.langCrt +
                        ".xlsx",
                      "_blank"
                    )
                  }
                  disableElevation
                >
                  <IC_DOCUMENT_DOWNLOAD_EXAMPLE /> {t("example_file")}
                </Button>
              </div>
            }
          />
          <CardContent>
            <input
              title="Chọn file excel"
              style={{ display: "none" }}
              id="container-upload-file"
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={(e) => {
                handleImportChange(e);
              }}
            />
            <label for="container-upload-file" style={{width:'100%'}}>
              <Button variant="contained" component="span" style={{width:'100%'}}>
              <IC_DOCUMENT_FOLDER />{" "}
                {fileSelected !== "" ? `(${fileSelected})` : t("choose_file")}
              </Button>
              {/* <div
                title={t("choose_file")}
                style={{
                  borderRadius: 5,
                  backgroundColor: "rgb(225 227 228 / 57%)",
                  padding: "2px 10px",
                }}
              >
                <IC_DOCUMENT_FOLDER />{" "}
                {fileSelected !== "" ? `(${fileSelected})` : t("choose_file")}
              </div> */}
            </label>
            {isError && (
              <Alert severity="error">{t("message.error_file")}</Alert>
            )}
            {dataSource.length > 0 && (
              <TableContainer className="tableContainer mt-2">
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      {columns?.map((col) => (
                        <TableCell
                          nowrap="true"
                          className={["p-2 border-0", "d-table-cell"].join(" ")}
                          key={col.key}
                        >
                          {t(col.title)}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody className="import-excel">
                    {dataSource?.length > 0 &&
                      dataSource?.map((item, index) => {
                        return (
                          <TableRow
                            style={{
                              border: !(
                                item.name &&
                                item.unitID &&
                                item.groupID
                              )
                                ? "1.5px solid red"
                                : item?.warning
                                ? "1.5px solid orange"
                                : "",
                            }}
                            onDoubleClick={() => handleEditRow(item, index)}
                            className={
                              item.groupID === null || item.unitID === null
                                ? "warning table-row-p8"
                                : "table-row-p8"
                            }
                            hover
                            role="checkbox"
                            tabIndex={-1}
                            key={index}
                          >
                            {columns?.map((col, indexRow) => {
                              let value = item[col.key];
                              if (col.key === "proctatus")
                                console.log("key-proctatus", value);
                              return col.key === "proctatus" ? (
                                <TableCell
                                  nowrap="true"
                                  key={indexRow}
                                  align={col.align}
                                >
                                  <Tooltip
                                    placement="top"
                                    title={t("Chỉnh sửa")}
                                    arrow
                                  >
                                    <EditIcon
                                      color={"primary"}
                                      className="cursor-pointer"
                                    />
                                  </Tooltip>
                                  {item?.warning && (
                                    <Tooltip
                                      placement="top"
                                      title={
                                        <div style={{ fontSize: "13px" }}>
                                          {t(item?.warning)}
                                        </div>
                                      }
                                      arrow
                                    >
                                      <InfoOutlinedIcon
                                        style={{ color: "red" }}
                                        className="cursor-pointer"
                                      />
                                    </Tooltip>
                                  )}
                                </TableCell>
                              ) : (
                                <Tooltip
                                  placement="top"
                                  title={
                                    <div
                                      style={{
                                        fontSize: "13px",
                                      }}
                                    >
                                      <span>
                                        {!value && "Chưa có thông tin"}
                                      </span>{" "}
                                      <span
                                        style={{
                                          color: col.status ? "red" : "orange",
                                        }}
                                      >
                                        {t(
                                          col.status
                                            ? "(Bắt buộc)"
                                            : "(Không bắt buộc)"
                                        )}
                                      </span>
                                    </div>
                                  }
                                  arrow
                                >
                                  <TableCell
                                    className="text-center"
                                    nowrap="true"
                                    key={indexRow}
                                    align={col.align}
                                    style={{
                                      background:
                                        !value && col?.status && "#e7cfcf",
                                    }}
                                  >
                                    {glb_sv.formatValue(value, col["type"])}
                                  </TableCell>
                                </Tooltip>
                              );
                            })}
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
          <CardActions
            className="align-items-end"
            style={{ justifyContent: "space-between" }}
          >
            <div>{lengthList.current - dataSource.length}/{lengthList.current}{" "}được thêm thành công</div>
            <div>
            <Button
              size="small"
              onClick={handleCloseModal}
              startIcon={<ExitToAppIcon />}
              variant="contained"
              disableElevation
            >
              {t("btn.close")} (Esc)
            </Button>
            {" "}
            <Button
              disabled={isEnableSave || !dataSource || dataSource.length === 0}
              variant="contained"
              size="small"
              onClick={handleOk}
              startIcon={!process && <SaveIcon />}
              className={
                !isEnableSave && dataSource && dataSource.length > 0
                  ? "bg-success text-white"
                  : ""
              }
            >
              {t("btn.save")} (F3)
            </Button>
            </div>
          </CardActions>
        </Card>
      </Dialog>

      {/* Modal cập nhật dòng dữ liệu */}
      <ModalUpdateProduct
        shouldOpenModalEdit={shouldOpenModalEdit}
        editModal={editModal}
        handleSelectProductGroup={handleSelectProductGroup}
        step19Ref={step19Ref}
        handleSelectUnit={handleSelectUnit}
        isInfoObj={isInfoObj}
        setIsInfoObj={setIsInfoObj}
        handleUpdateRow={handleUpdateRow}
        setShouldOpenModalEdit={setShouldOpenModalEdit}
        setEditID={setEditID}
        setEditModal={setEditModal}
        productDefaulModal
      />
    </>
  );
};

export default ImportExcel;
