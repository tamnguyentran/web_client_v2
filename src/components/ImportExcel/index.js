import React, { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import { useTranslation } from "react-i18next";
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
  Grid,
  TextField,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
  Tooltip,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import SaveIcon from "@material-ui/icons/Save";
import EditIcon from "@material-ui/icons/Edit";
import InfoOutlinedIcon from "@material-ui/icons/InfoOutlined";
import PauseCircleOutlineIcon from "@material-ui/icons/PauseCircleOutline";
import CheckCircleOutlineIcon from "@material-ui/icons/CheckCircleOutline";
import ErrorOutlineIcon from "@material-ui/icons/ErrorOutline";
import Alert from "@material-ui/lab/Alert";
import PublishIcon from "@material-ui/icons/Publish";
import sendRequest from "../../utils/service/sendReq";
import reqFunction from "../../utils/constan/functions";
import glb_sv from "../../utils/service/global_service";
import control_sv from "../../utils/service/control_services";
import ProductGroup_Autocomplete from "../../views/Products/ProductGroup/Control/ProductGroup.Autocomplete";
import UnitAdd_Autocomplete from "../../views/Config/Unit/Control/UnitAdd.Autocomplete";

import { ReactComponent as IC_DOCUMENT_FOLDER } from "../../asset/images/document-folder.svg";
import { ReactComponent as IC_DOCUMENT_DOWNLOAD_EXAMPLE } from "../../asset/images/document-download-example.svg";
import info_dec from "./info_dec.json";

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
    functionName: "insert",
    reqFunct: reqFunction.PRODUCT_ADD,
    biz: "common",
    object: "products",
  },
};

const columns = [
  // { key: 'code', title: 'product.code' },
  { key: "proctatus", title: "product.procstat" },
  { key: "name", title: "product.name", status: 1 },
  { key: "group", title: "menu.productGroupp", status: 1 },
  { key: "unit", title: "product.minUnitt", status: 1 },
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
  { key: "invenqty", title: "product.store_current" },
  { key: "inven_price", title: "product.inven_price" },
  { key: "lotno", title: "order.import.lot_no" },
  { key: "expire_date", title: "order.import.exp_dt" },
  { key: "inven_min", title: "config.store_limit.minQuantity" },
  { key: "inven_max", title: "config.store_limit.maxQuantity" },
  { key: "imp_price", title: "config.price.importPrice" },
  { key: "imp_vat", title: "config.price.importVAT" },
  { key: "exp_price", title: "config.price.price" },
  { key: "exp_wprice", title: "config.price.wholePrice" },
  { key: "exp_vat", title: "config.price.exportVAT" },
  { key: "unit_other", title: "config.price.unit" },
  { key: "convert_rate", title: "config.unitRate.rate" },
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
  content: "",
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
  const [isExpanded, setIsExpanded] = useState(false);
  const [shouldOpenModalEdit, setShouldOpenModalEdit] = useState(false);
  const [editID, setEditID] = useState(null);
  const [editModal, setEditModal] = useState(productDefaulModal);
  const [fileSelected, setFileSelected] = useState("");
  const [isEnableSave, setIsEnableSave] = useState(false);

  const unitListRef = useRef([]);
  const groupListRef = useRef([]);

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
          "",
        ];
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
            groupObject.o_1,
            !e.code || e.code.trim() === "" ? "AUTO" : e.code.trim(),
            e.name,
            e.barcode,
            unitObject.o_1,
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
            "",
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
              unitObject.o_1,
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
              "",
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
              groupObject.o_1,
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
              "",
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
        dataAddExcelFaild.current = []
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
    let data = [];
    const fileReader = new FileReader();
    fileReader.readAsBinaryString(file);

    fileReader.onload = (event) => {
      try {
        const { result } = event.target;
        console.log(result);
        const workbook = XLSX.read(result, { type: "binary" });
        const sheetNameList = workbook.SheetNames;
        console.log(sheetNameList);
        sheetNameList.forEach(function (y) {
          const workSheet = workbook.Sheets[y];
          console.log(workSheet);
          const headers = {};
          for (const w in workSheet) {
            if (w[0] === "!") continue;
            //parse out the column, row, and value
            const row = parseInt(w.substring(1));
            console.log(row);
            if (row == beginRow - 1) {
              continue;
            }
            const col = w.substring(0, 1);
            const value = workSheet[w].v;
            //store header names
            if (row === beginRow) {
              headers[col] = value;
              continue;
            }
            if (!data[row - 1]) {
              data[row - 1] = {
                groupID: null,
                unitID: null,
              };
            }
            //-- set default process status
            // data[row - 1]['proctatus'] = 0
            data[row - 1][headers[col]] = value;
            // Thêm unitID và groupID cho data
            const unitObject = unitList.find(
              (x) => x.o_2 === data[row - 1]?.unit
            );
            const groupObject = groupList.find(
              (x) => x.o_2 === data[row - 1]?.group
            );
            data[row - 1]["unitID"] = !!unitObject?.o_1
              ? unitObject?.o_1
              : null;
            data[row - 1]["groupID"] = !!groupObject?.o_1
              ? groupObject?.o_1
              : null;
            // console.log('read file, col, value, row', col, value, row)
            // console.log('read file, data', JSON.stringify(data))
            console.log(data[row - 1]);
          }
          //drop those first two rows which are empty
          data.shift();
          data.shift();

          // Check những đơn vị tính và nhóm sp chưa có
          const unitSysNameList = unitList.map((x) => x.o_2);
          const groupSysNameList = groupList.map((x) => x.o_2);
          const unitDataNameList = data.map((x) => x.unit);
          const groupDataNameList = data.map((x) => x.group);
          // Lưu các đơn vị/nhóm sp chưa có trên system => gửi event tạo các đơn vị/nhóm sp mới
          setUnitNotAvailable([
            ...new Set(
              unitDataNameList.filter((item) => !unitSysNameList.includes(item))
            ),
          ]);
          setGroupNotAvailable([
            ...new Set(
              groupDataNameList.filter(
                (item) => !groupSysNameList.includes(item)
              )
            ),
          ]);

          console.log(data);
          setDataSource([...data]);
          console.log("read file, data", JSON.stringify([...data]));
        });
      } catch (e) {}
    };
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
        console.log(files[0]);
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

  const handleChange = (e) => {
    const newModal = { ...editModal };
    newModal[e.target.name] =
      e.target.name === "name" ? e.target.value.toUpperCase() : e.target.value;
    setEditModal(newModal);
  };

  const handleChangeExpand = () => {
    setIsExpanded((e) => !e);
  };

  const handleSelectProductGroup = (obj) => {
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
    let newDataSource = JSON.parse(JSON.stringify(dataSource));
    newDataSource.splice(editID, 1, editModal);
    setDataSource(newDataSource);
    setEditID(null);
    setEditModal({ ...productDefaulModal });
    setShouldOpenModalEdit(false);
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
              style={{ display: "none" }}
              id="container-upload-file"
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleImportChange}
            />
            <label htmlFor="container-upload-file" style={{ width: "100%" }}>
              <div
                title={t("choose_file")}
                style={{
                  borderRadius: 5,
                  backgroundColor: "rgb(225 227 228 / 57%)",
                  padding: "2px 10px",
                }}
              >
                <IC_DOCUMENT_FOLDER />{" "}
                {fileSelected !== "" ? `(${fileSelected})` : t("choose_file")}
              </div>
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
                              console.log(item);
                              console.log("key", col.key);
                              console.log("value", value);
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
                                    <EditIcon color={"primary"} className="cursor-pointer"/>
                                  </Tooltip>
                                  {item?.warning && (
                                    <Tooltip
                                      placement="top"
                                      title={t(item?.warning)}
                                      arrow
                                    >
                                      <InfoOutlinedIcon style={{color:'orange'}} className="cursor-pointer" />
                                    </Tooltip>
                                  )}
                                  {/* {value === 0 ? (
                                    <Tooltip
                                      placement="top"
                                      title={t("product.tooltip.not_process")}
                                      arrow
                                    >
                                      <PauseCircleOutlineIcon />
                                    </Tooltip>
                                  ) : value === 1 ? (
                                    <Tooltip
                                      placement="top"
                                      title={t("product.tooltip.success")}
                                      arrow
                                    >
                                      <CheckCircleOutlineIcon color="primary" />
                                    </Tooltip>
                                  ) : (
                                    <Tooltip
                                      placement="top"
                                      title={t('product.tooltip.fail')}
                                      arrow
                                    >
                                      <ErrorOutlineIcon color="secondary" />
                                    </Tooltip>
                                  )} */}
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
                                    nowrap="true"
                                    key={indexRow}
                                    align={col.align}
                                    style={{
                                      background:
                                        !value && col?.status && "#e7cfcf",
                                    }}
                                  >
                                    {glb_sv.formatValue(value)}
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
            style={{ justifyContent: "flex-end" }}
          >
            <Button
              size="small"
              onClick={handleCloseModal}
              startIcon={<ExitToAppIcon />}
              variant="contained"
              disableElevation
            >
              {t("btn.close")} (Esc)
            </Button>
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
          </CardActions>
        </Card>
      </Dialog>

      {/* Modal cập nhật dòng dữ liệu */}
      <Dialog fullWidth={true} maxWidth="md" open={shouldOpenModalEdit}>
        <Card className="product-card">
          <CardHeader title={t("product.titleEdit")} />
          <CardContent>
            <Grid container spacing={1}>
              <Grid item xs={6} sm={3}>
                <Tooltip
                  placement="top"
                  title={t("product.tooltip.productCode")}
                  arrow
                >
                  <TextField
                    fullWidth={true}
                    autoComplete="off"
                    margin="dense"
                    label={t("product.code")}
                    value={editModal.code}
                    name="code"
                    handleChange={handleChange}
                    variant="outlined"
                    className="uppercaseInput"
                    inputRef={step1Ref}
                    onKeyPress={(event) => {
                      if (event.key === "Enter") {
                        step2Ref.current.focus();
                      }
                    }}
                  />
                </Tooltip>
              </Grid>

              <Grid item xs={6} sm={3}>
                <TextField
                  fullWidth={true}
                  required={true}
                  autoComplete="off"
                  margin="dense"
                  label={t("product.name")}
                  onChange={handleChange}
                  value={editModal.name}
                  name="name"
                  variant="outlined"
                  className="uppercaseInput"
                  inputRef={step2Ref}
                  onKeyPress={(event) => {
                    if (event.key === "Enter") {
                      step3Ref.current.focus();
                    }
                  }}
                />
              </Grid>

              <Grid item xs={6} sm={3}>
                <ProductGroup_Autocomplete
                  productGroupID={editModal.groupID || null}
                  style={{ marginTop: 8, marginBottom: 4 }}
                  size={"small"}
                  label={t("menu.productGroup")}
                  onSelect={handleSelectProductGroup}
                  inputRef={step3Ref}
                  onKeyPress={(event) => {
                    if (event.key === "Enter") {
                      step4Ref.current.focus();
                    }
                  }}
                />
              </Grid>

              <Grid item xs={6} sm={3} className="d-flex align-items-center">
                <UnitAdd_Autocomplete
                  unitID={editModal.unitID}
                  style={{ marginTop: 8, marginBottom: 4 }}
                  size={"small"}
                  label={t("menu.configUnit")}
                  onSelect={handleSelectUnit}
                  inputRef={step4Ref}
                  onKeyPress={(event) => {
                    if (event.key === "Enter") {
                      step5Ref.current.focus();
                    }
                  }}
                />
              </Grid>

              <Grid item xs={6} sm={3}>
                <Tooltip
                  placement="top"
                  title={t("product.tooltip.barcode")}
                  arrow
                >
                  <TextField
                    fullWidth={true}
                    autoComplete="off"
                    margin="dense"
                    label={t("product.barcode")}
                    onChange={handleChange}
                    value={editModal.barcode}
                    name="barcode"
                    variant="outlined"
                    inputRef={step5Ref}
                    onKeyPress={(event) => {
                      if (event.key === "Enter") {
                        step6Ref.current.focus();
                      }
                    }}
                  />
                </Tooltip>
              </Grid>

              <Grid item xs={6} sm={3}>
                <TextField
                  fullWidth={true}
                  margin="dense"
                  autoComplete="off"
                  label={t("product.packing")}
                  onChange={handleChange}
                  value={editModal.packing}
                  name="packing"
                  variant="outlined"
                  inputRef={step6Ref}
                  onKeyPress={(event) => {
                    if (event.key === "Enter") {
                      step7Ref.current.focus();
                    }
                  }}
                />
              </Grid>

              <Grid item xs={6} sm={6}>
                <TextField
                  fullWidth={true}
                  margin="dense"
                  autoComplete="off"
                  label={t("product.content")}
                  onChange={handleChange}
                  value={editModal.contents}
                  name="contents"
                  variant="outlined"
                  inputRef={step7Ref}
                  onKeyPress={(event) => {
                    if (event.key === "Enter") {
                      setIsExpanded(true);
                      setTimeout(() => {
                        step8Ref.current.focus();
                      }, 10);
                    }
                  }}
                />
              </Grid>
            </Grid>

            <Accordion
              className="mt-2"
              expanded={isExpanded}
              onChange={handleChangeExpand}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1bh-content"
                id="panel1bh-header"
                height="50px"
              >
                <Typography className="">{t("product.infoExpand")}</Typography>
              </AccordionSummary>
              <AccordionDetails className="pt-0">
                <Grid container className="" spacing={1}>
                  <Grid item xs={12} sm={6} md={6}>
                    <TextField
                      fullWidth={true}
                      margin="dense"
                      autoComplete="off"
                      label={t("product.designate")}
                      onChange={handleChange}
                      value={editModal.designate}
                      name="designate"
                      variant="outlined"
                      inputRef={step8Ref}
                      onKeyPress={(event) => {
                        if (event.key === "Enter") {
                          step9Ref.current.focus();
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={6}>
                    <TextField
                      fullWidth={true}
                      margin="dense"
                      autoComplete="off"
                      label={t("product.contraind")}
                      onChange={handleChange}
                      value={editModal.contraind}
                      name="contraind"
                      variant="outlined"
                      inputRef={step9Ref}
                      onKeyPress={(event) => {
                        if (event.key === "Enter") {
                          step10Ref.current.focus();
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={6}>
                    <TextField
                      fullWidth={true}
                      margin="dense"
                      autoComplete="off"
                      label={t("product.dosage")}
                      onChange={handleChange}
                      value={editModal.dosage}
                      name="dosage"
                      variant="outlined"
                      inputRef={step10Ref}
                      onKeyPress={(event) => {
                        if (event.key === "Enter") {
                          step11Ref.current.focus();
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={6}>
                    <TextField
                      fullWidth={true}
                      margin="dense"
                      autoComplete="off"
                      label={t("product.manufact")}
                      onChange={handleChange}
                      value={editModal.manufact}
                      name="manufact"
                      variant="outlined"
                      inputRef={step11Ref}
                      onKeyPress={(event) => {
                        if (event.key === "Enter") {
                          step12Ref.current.focus();
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={6}>
                    <TextField
                      fullWidth={true}
                      margin="dense"
                      autoComplete="off"
                      label={t("product.interact")}
                      onChange={handleChange}
                      value={editModal.interact}
                      name="interact"
                      variant="outlined"
                      inputRef={step12Ref}
                      onKeyPress={(event) => {
                        if (event.key === "Enter") {
                          step13Ref.current.focus();
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={6}>
                    <TextField
                      fullWidth={true}
                      margin="dense"
                      autoComplete="off"
                      label={t("product.storages")}
                      onChange={handleChange}
                      value={editModal.storages}
                      name="storages"
                      variant="outlined"
                      inputRef={step13Ref}
                      onKeyPress={(event) => {
                        if (event.key === "Enter") {
                          step14Ref.current.focus();
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={6}>
                    <TextField
                      fullWidth={true}
                      margin="dense"
                      autoComplete="off"
                      label={t("product.effect")}
                      onChange={handleChange}
                      value={editModal.effect}
                      name="effect"
                      variant="outlined"
                      inputRef={step14Ref}
                      onKeyPress={(event) => {
                        if (event.key === "Enter") {
                          step15Ref.current.focus();
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={6}>
                    <TextField
                      fullWidth={true}
                      margin="dense"
                      autoComplete="off"
                      label={t("product.overdose")}
                      onChange={handleChange}
                      value={editModal.overdose}
                      name="overdose"
                      variant="outlined"
                      inputRef={step15Ref}
                      onKeyPress={(event) => {
                        if (event.key === "Enter") {
                          handleUpdateRow();
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </CardContent>
          <CardActions
            className="align-items-end"
            style={{ justifyContent: "flex-end" }}
          >
            <Button
              size="small"
              onClick={(e) => {
                setShouldOpenModalEdit(false);
                setEditID(null);
                setEditModal({ ...productDefaulModal });
              }}
              startIcon={<ExitToAppIcon />}
              variant="contained"
              disableElevation
            >
              {t("btn.close")} (Esc)
            </Button>
            <Button
              size="small"
              onClick={() => handleUpdateRow()}
              variant="contained"
              disabled={
                !editModal?.name?.trim() ||
                !editModal?.groupID ||
                !editModal?.unitID
                  ? true
                  : false
              }
              className={
                !editModal?.name?.trim() ||
                !editModal?.groupID ||
                !editModal?.unitID
                  ? ""
                  : "bg-success text-white"
              }
            >
              {t("btn.update")} (F3)
            </Button>
          </CardActions>
        </Card>
      </Dialog>
    </>
  );
};

export default ImportExcel;
