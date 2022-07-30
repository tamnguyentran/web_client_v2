import React, { useState, useRef, useEffect } from "react";
import "./style.css";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  IconButton,
  Chip,
  Button,
  Dialog,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableContainer,
  TableHead,
  Tooltip,
  Grid,
  TextField,
  Avatar,
  // Divider,
  // Checkbox,
  // FormControlLabel,
  // Collapse,
  // Box,
  // Paper,
  // TableFooter,
} from "@material-ui/core";
import TextImage from "../../../components/TextImage";
// import EditIcon from "@material-ui/icons/Edit";
// import FastForwardIcon from "@material-ui/icons/FastForward";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import CheckIcon from "@material-ui/icons/Check";
import DeleteIcon from "@material-ui/icons/Delete";
import LoopIcon from "@material-ui/icons/Loop";
// import ColumnCtrComp from "../../../components/_ColumnCtr";
// import LockIcon from "@material-ui/icons/Lock";
// import LockOpenIcon from "@material-ui/icons/LockOpen";
// import KeyboardArrowUpIcon from "@material-ui/icons/KeyboardArrowUp";
// import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
// import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
// import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import AutorenewIcon from "@material-ui/icons/Autorenew";
import DisplayColumn from "../../../components/DisplayColumn";

import glb_sv from "../../../utils/service/global_service";
import control_sv from "../../../utils/service/control_services";
import SnackBarService from "../../../utils/service/snackbar_service";
import sendRequest from "../../../utils/service/sendReq";
import reqFunction from "../../../utils/constan/functions";

import { tableColumn, config, tableColumnDetail } from "./Modal/Product.modal";
// import ProductAdd from "./ProductAdd";
import ProductEdit from "./ProductEdit";
// import SearchOne from "../../../components/SearchOne";
// import ExportExcel from "../../../components/ExportExcel";
// import DisplayColumn from "../../../components/DisplayColumn";
// import ImportExcel from "../../../components/ImportExcel";
import Breadcrumb from "../../../components/Breadcrumb/View";
import { ReactComponent as IC_SHAPE } from "../../../asset/images/shape.svg";
import { ReactComponent as IC_VECTOR } from "../../../asset/images/vector.svg";
import { ReactComponent as IC_ADD } from "../../../asset/images/add.svg";
import { ReactComponent as IC_LIST } from "../../../asset/images/list.svg";
import { ReactComponent as IC_TRASH } from "../../../asset/images/trash.svg";
import { ReactComponent as IC_EDIT } from "../../../asset/images/edit.svg";
import { ReactComponent as IC_UNLOCK } from "../../../asset/images/unlock.svg";
import { ReactComponent as IC_LOCK } from "../../../asset/images/lock.svg";
import { useHotkeys } from "react-hotkeys-hook";

import {
  CheckBoxCpn,
  TitleFilterCpn,
  TextFieldCpn,
  Wrapper,
  IconButtonCpn,
  ButtonCpn,
} from "../../../basicComponents";

import { useHistory } from "react-router-dom";

const serviceInfo = {
  GET_ALL: {
    functionName: config["list"].functionName,
    reqFunct: config["list"].reqFunct,
    biz: config.biz,
    object: config.object,
  },
  DELETE: {
    functionName: config["delete"].functionName,
    reqFunct: config["delete"].reqFunct,
    biz: config.biz,
    object: config.object,
  },
  LOCK: {
    functionName: "blocking",
    reqFunct: reqFunction.LOCK_PRODUCT_UPDATE,
    biz: "common",
    object: "products",
  },
};

const ProductList = () => {
  let history = useHistory();
  const { t } = useTranslation();
  const [anChorEl, setAnChorEl] = useState(null);
  const [column, setColumn] = useState(tableColumn);
  const [searchValue, setSearchValue] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const [dataSource, setDataSource] = useState([]);

  const [shouldOpenRemoveModal, setShouldOpenRemoveModal] = useState(false);
  const [shouldOpenEditModal, setShouldOpenEditModal] = useState(false);
  const [shouldOpenLockModal, setShouldOpenLockModal] = useState(false);
  const [lockModal, setLockModal] = useState({});
  const [lockNote, setLockNote] = useState("");
  const [processing, setProcessing] = useState(false);
  const [searchProcess, setSearchProcess] = useState(false);
  const [id, setId] = useState(0);
  const [imgValue, setImgValue] = useState("");
  const [name, setName] = useState("");
  const [openShowTableDetail, setOpenShowTableDetail] = useState(0);

  const [isShowLayout, setIsShowLayout] = useState(false);

  const dataSourceRef = useRef([]);
  const searchRef = useRef("");
  const idRef = useRef(0);

  useHotkeys("f10", () => {
    if (processing) return;
    handleDelete();
  });

  useEffect(() => {
    getList(glb_sv.defaultValueSearch, "");
  }, []);

  const getList = (lastIndex, value) => {
    if (searchProcess) return;
    const inputParam = [lastIndex, "%" + value.trim() + "%"];
    setSearchProcess(true);
    sendRequest(
      serviceInfo.GET_ALL,
      inputParam,
      handleResultGetAll,
      true,
      handleTimeOut
    );
  };

  //-- xử lý khi timeout -> ko nhận được phản hồi từ server
  const handleTimeOut = (e) => {
    SnackBarService.alert(t(`message.${e.type}`), true, 4, 3000);
    setProcessing(false);
    setSearchProcess(false);
  };

  const handleResultGetAll = (reqInfoMap, message) => {
    setSearchProcess(false);
    if (message["PROC_STATUS"] !== 1) {
      // xử lý thất bại
      const cltSeqResult = message["REQUEST_SEQ"];
      glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap);
      control_sv.clearReqInfoMapRequest(cltSeqResult);
    } else if (message["PROC_DATA"]) {
      let newData = message["PROC_DATA"];
      if (newData.rows.length > 0) {
        dataSourceRef.current = dataSourceRef.current.concat(newData.rows);
        setDataSource(dataSourceRef.current);
        if (reqInfoMap.inputParam[0] === glb_sv.defaultValueSearch) {
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
        setDataSource([]);
        setTotalRecords(0);
      }
    }
  };

  const handleResultRemove = (reqInfoMap, message) => {
    SnackBarService.alert(
      message["PROC_MESSAGE"],
      true,
      message["PROC_STATUS"],
      3000
    );
    setShouldOpenRemoveModal(false);
    setProcessing(false);
    if (message["PROC_STATUS"] !== 1) {
      // xử lý thất bại
      const cltSeqResult = message["REQUEST_SEQ"];
      glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap);
      control_sv.clearReqInfoMapRequest(cltSeqResult);
    } else if (message["PROC_DATA"]) {
      dataSourceRef.current = [];
      setName("");
      setId(0);
      setDataSource([]);
      setTotalRecords(0);
      getList(glb_sv.defaultValueSearch, searchValue);
    }
  };

  const onCloseColumn = () => {
    setAnChorEl(null);
  };

  const onChangeColumnView = (item) => {
    const newColumn = [...column];
    const index = newColumn.findIndex((obj) => obj.field === item.field);
    if (index >= 0) {
      newColumn[index]["show"] = !column[index]["show"];
      setColumn(newColumn);
    }
  };

  const searchSubmit = (value) => {
    // if (value === searchRef.current) return
    searchRef.current = value;
    dataSourceRef.current = [];
    setSearchValue(value);
    setTotalRecords(0);
    getList(glb_sv.defaultValueSearch, value);
  };

  const onRemove = (item) => {
    setShouldOpenRemoveModal(item ? true : false);
    setId(item ? item.o_1 : 0);
    setName(item ? item.o_5 : "");
  };

  const onEdit = (item) => {
    setShouldOpenEditModal(item ? true : false);
    setId(item ? item.o_1 : 0);
    setImgValue(item.o_19 || "");
    idRef.current = item && item.o_1 > 0 ? item.item && item.o_1 > 0 : 0;
  };

  const handleDelete = (e) => {
    // e.preventDefault();
    if (processing) return;
    idRef.current = id;
    setProcessing(true);
    sendRequest(
      serviceInfo.DELETE,
      [id],
      handleResultRemove,
      true,
      handleTimeOut
    );
  };

  const getNextData = () => {
    if (dataSourceRef.current.length > 0) {
      const lastIndex = dataSourceRef.current.length - 1;
      const lastID = dataSourceRef.current[lastIndex].o_1;
      getList(lastID, searchValue);
    }
  };

  const headersCSV = [
    { label: t("stt"), key: "stt" },
    { label: t("menu.productGroup"), key: "productGroup" },
    // { label: t('product.code'), key: 'code' },
    { label: t("product.name"), key: "name" },
    { label: t("product.barcode"), key: "barcode" },
    { label: t("product.content"), key: "content" },
    { label: t("product.contraind"), key: "contraind" },
    { label: t("product.designate"), key: "designate" },
    { label: t("product.dosage"), key: "dosage" },
    { label: t("product.interact"), key: "interact" },
    { label: t("product.manufact"), key: "manufact" },
    { label: t("product.effect"), key: "effect" },
    { label: t("product.overdose"), key: "overdose" },
    { label: t("product.packing"), key: "packing" },
    { label: t("product.storages"), key: "storages" },
    { label: t("menu.configUnit"), key: "unit" },
    { label: t("createdUser"), key: "createdUser" },
    { label: t("createdDate"), key: "createdDate" },
    { label: t("titleBranch"), key: "titleBranch" },
  ];

  const dataCSV = () => {
    const result = dataSource.map((item, index) => {
      const data = item;
      item = {};
      item["stt"] = index + 1;
      item["productGroup"] = data.o_3;
      item["name"] = data.o_5;
      item["barcode"] = data.o_6;
      item["content"] = data.o_7;
      item["contraind"] = data.o_8;
      item["designate"] = data.o_8;
      item["dosage"] = data.o_10;
      item["interact"] = data.o_11;
      item["manufact"] = data.o_12;
      item["effect"] = data.o_13;
      item["overdose"] = data.o_14;
      item["packing"] = data.o_15;
      item["storages"] = data.o_16;
      item["unit"] = data.o_18;
      item["createdUser"] = data.o_20;
      item["createdDate"] = glb_sv.formatValue(data.o_21, "date");
      item["titleBranch"] = data.o_22;
      return item;
    });

    return result;
  };

  const handleRefresh = () => {
    dataSourceRef.current = [];
    setTotalRecords(0);
    getList(glb_sv.defaultValueSearch, searchValue);
  };

  const onLock = (item) => {
    setLockModal(item);
    setShouldOpenLockModal(true);
  };

  const handleLock = () => {
    if (processing || !lockModal.o_1) return;
    setProcessing(true);
    const inputParam = [
      lockModal.o_1,
      lockModal.o_23 === "Y" ? "N" : "Y",
      lockNote,
    ];
    sendRequest(
      serviceInfo.LOCK,
      inputParam,
      handleResultLockProduct,
      true,
      handleTimeOut
    );
  };

  const handleResultLockProduct = (reqInfoMap, message) => {
    SnackBarService.alert(
      message["PROC_MESSAGE"],
      true,
      message["PROC_STATUS"],
      3000
    );
    setProcessing(false);
    if (message["PROC_STATUS"] !== 1) {
      // xử lý thất bại
      const cltSeqResult = message["REQUEST_SEQ"];
      glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap);
      control_sv.clearReqInfoMapRequest(cltSeqResult);
    } else if (message["PROC_DATA"]) {
      handleRefresh();
      setShouldOpenLockModal(false);
      setLockModal({});
      setLockNote("");
    }
  };

  return (
    <>
      <div className="product p-2">
        <Wrapper.WrapperFilter isShowLayout={isShowLayout}>
          <div className="p-2">
            <div className="mb-4">
              <TitleFilterCpn className="mb-2" label="Tìm kiếm" />
              <TextFieldCpn label="Tên sản phẩm" />
            </div>
            <div className="mb-4">
              <TitleFilterCpn className="mb-2" label="Lọc theo loại hàng" />
              <TextFieldCpn label="Nhóm sản phẩm" />
            </div>
            <TitleFilterCpn className="mb-2" label="Lọc theo tồn kho" />
            <div>
              <div>
                <CheckBoxCpn label="Còn hàng" />
              </div>
              <div>
                <CheckBoxCpn label="Hết hàng" />
              </div>
              <div>
                <CheckBoxCpn label="Vượt định mức tồn" />
              </div>
              <div>
                <CheckBoxCpn label="Hàng cảnh báo hết HSD" />
              </div>
              <div></div>
            </div>
          </div>
        </Wrapper.WrapperFilter>
        <Wrapper.WrapperTable
          isShowLayout={isShowLayout}
          setIsShowLayout={setIsShowLayout}
        >
          <Wrapper.WrapperHeader>
            <div>
              <Breadcrumb description="Đây là trang giúp bạn tìm kiếm thông tin sản phẩm mà nhà thuốc đang kinh doanh theo các điều kiện lọc bên trái" />
            </div>
            <div className="flex">
              <Button
                size="medium"
                className="primary-bg text-white h-btn"
                variant="contained"
                onClick={() => {
                  history.push({
                    pathname: "/page/products/add-product",
                  });
                }}
              >
                <IC_ADD className="pr-1" />
                <div>Thêm mới SP</div>
              </Button>
              <button className="btn-custom ml-2 mr-2">
                <IC_VECTOR className="pr-1" />
                <div>Nhập từ Excel</div>
              </button>
              <DisplayColumn
                columns={tableColumn}
                handleCheckChange={onChangeColumnView}
              />
            </div>
          </Wrapper.WrapperHeader>
          <Wrapper.WrapperContent>
            <TableContainer className="table-list-product">
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    {column?.map((col) => (
                      <TableCell
                        nowrap="true"
                        className={`p-2 text-uppercase text-black ${
                          !col.show && "dl-none"
                        }`}
                        key={col.field}
                      >
                        {t(col.title)}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dataSource?.length > 0 &&
                    dataSource?.map((item, index) => {
                      return (
                        <>
                          <TableRow
                            hover
                            role="checkbox"
                            tabIndex={-1}
                            key={index}
                          >
                            {column?.map((col, indexRow) => {
                              let value = item[col.field];
                              if (col.show) {
                                switch (col.field) {
                                  case "stt":
                                    return (
                                      <TableCell
                                        nowrap="true"
                                        key={indexRow}
                                        align={col.align}
                                        className="fz14"
                                      >
                                        {index + 1}
                                      </TableCell>
                                    );
                                  case "o_19":
                                    return (
                                      <TableCell
                                        nowrap="true"
                                        key={indexRow}
                                        align={col.align}
                                        className="fz14"
                                      >
                                        <Avatar
                                          variant="square"
                                          className="m-1 small-avata"
                                          src={`http://171.244.133.198/upload/product/${item.o_19}`}
                                        >
                                          <TextImage className="fz14" />
                                        </Avatar>
                                      </TableCell>
                                    );

                                  case "action":
                                    return (
                                      <TableCell
                                        nowrap="true"
                                        key={indexRow}
                                        align={col.align}
                                      >
                                        <IconButtonCpn.IconButtonEdit
                                          onClick={() => {
                                            onEdit(item);
                                          }}
                                        />
                                        <IconButtonCpn.IconButtonTrash
                                          onClick={() => {
                                            onEdit(item);
                                          }}
                                        />
                                        <IconButtonCpn.IconButtonLock
                                          checkLock={item["o_23"] === "N"}
                                          onClick={() => {
                                            onLock(item);
                                          }}
                                        />
                                      </TableCell>
                                    );
                                  default:
                                    return (
                                      <TableCell
                                        nowrap="true"
                                        key={indexRow}
                                        align={col.align}
                                        className="fz14"
                                      >
                                        {glb_sv.formatValue(value, col["type"])}
                                      </TableCell>
                                    );
                                }
                              }
                            })}
                          </TableRow>
                        </>
                      );
                    })}
                </TableBody>
              </Table>
            </TableContainer>
          </Wrapper.WrapperContent>
          <Wrapper.WrapperFooter>
            <ButtonCpn.ButtonGetMoreData
              onClick={getNextData}
              totalRecords={totalRecords}
              displayRecords={dataSourceRef.current.length}
              disabled={dataSourceRef.current.length >= totalRecords}
            />
            {/* Hiển thị{" "}
            {dataSourceRef.current.length +
              "/" +
              totalRecords +
              " " +
              t("rowData")}
            <button
              className="btn-custom ml-3 mr-2"
              disabled={dataSourceRef.current.length >= totalRecords}
              onClick={getNextData}
              style={{
                background:
                  dataSourceRef.current.length >= totalRecords &&
                  "var(--gray3)",
              }}
            >
              <IC_SHAPE className="pr-1" /> Lấy thêm dữ liệu{" "}
              {searchProcess && <AutorenewIcon className="button-loading" />}
            </button> */}
            <button className="btn-custom">
              <IC_VECTOR className="pr-1" />
              <div>Xuất ra Excel</div>
            </button>
          </Wrapper.WrapperFooter>
        </Wrapper.WrapperTable>
      </div>
      {/* <Card className="mb-2">
        <CardHeader
          title={<div className="flex aligh-item-center">{<Breadcrumb />}</div>}
        />
        <CardContent>
          <SearchOne
            itemGrd={3}
            process={searchProcess}
            name="product_name"
            label={"product.search_name"}
            searchSubmit={searchSubmit}
          />
        </CardContent>
      </Card> */}
      {/* <ColumnCtrComp
        anchorEl={anChorEl}
        columns={tableColumn}
        handleClose={onCloseColumn}
        checkColumnChange={onChangeColumnView}
      /> */}

      {/* <Grid container spacing={1} className="h-100">
        <Grid item md={2} xs={12} className="h-100">
          <Card className="h-100">
            <CardHeader title={"Tìm kiếm"} />
            <CardContent className="h-100">
              <div>
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Tên sản phẩm"
                  id="fullWidth"
                  size="small"
                />
              </div>

              <div style={{ marginTop: "10px" }}>
                <div
                  style={{
                    borderBottom: "2px solid #066190",
                    color: "#066190",
                    marginBottom: "10px",
                  }}
                >
                  Lọc
                </div>
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Nhóm sản phẩm"
                  id="fullWidth"
                  size="small"
                />
                <TextField
                  fullWidth
                  variant="outlined"
                  label="đơn sản phẩm"
                  id="fullWidth"
                  size="small"
                />
              </div>
            </CardContent>
          </Card>
        </Grid>
        <Grid item md={10} xs={12} className="h-100">
          <Card className="h-100">
            <CardHeader
              title={
                <>
                  {t("product.titleList")}
                  <DisplayColumn
                    columns={tableColumn}
                    handleCheckChange={onChangeColumnView}
                  />
                </>
              }
              action={
                <div className="d-flex align-items-center">
                  <ImportExcel onRefresh={handleRefresh} />
                  &ensp;
                  <ProductAdd onRefresh={handleRefresh} />
                </div>
              }
            />
            <CardContent className="h-100" style={{ padding: "0px" }}>
              <TableContainer
                className="height-table-260 tableContainer tableReport"
                style={{ padding: "0px 10px" }}
              >
                <Table stickyHeader>
                  <caption
                    className={[
                      "text-center text-danger border-bottom",
                      dataSource.length > 0 ? "dl-none" : "",
                    ].join(" ")}
                  >
                    {t("lbl.emptyData")}
                  </caption>
                  <TableHead>
                    <TableRow>
                      {column?.map((col) => (
                        <TableCell
                          nowrap="true"
                          className={[
                            "p-2 border-0",
                            col.show ? "d-table-cell" : "dl-none",
                          ].join(" ")}
                          key={col.field}
                        >
                          {t(col.title)}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dataSource?.length > 0 &&
                      dataSource?.map((item, index) => {
                        return (
                          <>
                            <TableRow
                              hover
                              role="checkbox"
                              tabIndex={-1}
                              key={index}
                            >
                              {column?.map((col, indexRow) => {
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
                                          {glb_sv.userLev === "0" && (
                                            <Tooltip
                                              title={
                                                t(
                                                  item["o_23"] === "Y"
                                                    ? "product.unblock_yn"
                                                    : "product.block_yn"
                                                ) + "?"
                                              }
                                            >
                                              {item["o_23"] === "N" ? (
                                                <IconButton
                                                  onClick={(e) => {
                                                    onLock(item);
                                                  }}
                                                >
                                                  <LockOpenIcon
                                                    color={"primary"}
                                                    className="cursor-pointer"
                                                  ></LockOpenIcon>
                                                </IconButton>
                                              ) : (
                                                <IconButton>
                                                  <LockIcon
                                                    color={"error"}
                                                    className="cursor-pointer"
                                                    onClick={(e) => {
                                                      onLock(item);
                                                    }}
                                                  ></LockIcon>
                                                </IconButton>
                                              )}
                                            </Tooltip>
                                          )}
                                          <IconButton
                                            onClick={(e) => {
                                              onRemove(item);
                                            }}
                                          >
                                            <DeleteIcon
                                              style={{ color: "red" }}
                                              fontSize="small"
                                            />
                                          </IconButton>
                                          <IconButton
                                            onClick={(e) => {
                                              onEdit(item);
                                            }}
                                          >
                                            <EditIcon
                                              color={"primary"}
                                              fontSize="small"
                                            />
                                          </IconButton>
                                        </TableCell>
                                      );
                                    case "o_19":
                                      return (
                                        <TableCell
                                          style={{ padding: "30px" }}
                                          nowrap="true"
                                          key={indexRow}
                                          align={col.align}
                                        >
                                          <Avatar
                                            variant="square"
                                            style={{
                                              height: "60px",
                                              width: "60px",
                                              margin: "10px",
                                            }}
                                            src={`http://171.244.133.198/upload/product/${item.o_19}`}
                                          >
                                            <TextImage className="fz14" />
                                          </Avatar>
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

                            <TableRow>
                              <TableCell colSpan={12}>
                                bdbdbdbdbdbdbdbdbdbdbdbdbdbdbdbdbdbdbdbdbdbdbdbdbdbdbdbdbdbdbdbdbdbdbdbdbdbdbdbdbdbdbdbdbdbdbdbdbdbdbdbdbdbdbdbdbdbdbdbdbdbdbdbdbdbd
                              </TableCell>
                            </TableRow>
                          </>
                        );
                      })}
                  </TableBody>
                </Table>
              </TableContainer>
              <CardActions>
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
                      t("rowData")
                    }
                  />
                  <Chip
                    variant="outlined"
                    size="small"
                    className="mr-1"
                    deleteIcon={<FastForwardIcon />}
                    onDelete={() => null}
                    label={t("getMoreData")}
                    onClick={getNextData}
                    disabled={dataSourceRef.current.length >= totalRecords}
                  />
                  <ExportExcel
                    filename="product"
                    data={dataCSV()}
                    headers={headersCSV}
                  />
                </div>
              </CardActions>
            </CardContent>

            <CardActions>
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
                    t("rowData")
                  }
                />
                <Chip
                  variant="outlined"
                  size="small"
                  className="mr-1"
                  deleteIcon={<FastForwardIcon />}
                  onDelete={() => null}
                  label={t("getMoreData")}
                  onClick={getNextData}
                  disabled={dataSourceRef.current.length >= totalRecords}
                />
                <ExportExcel
                  filename="product"
                  data={dataCSV()}
                  headers={headersCSV}
                />
              </div>
            </CardActions>
          </Card>
        </Grid>
      </Grid> */}

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
        open={shouldOpenRemoveModal}
        onClose={(e) => {
          if (processing) return;
          setShouldOpenRemoveModal(false);
        }}
      >
        <Card>
          <CardHeader title={t("product.titleRemove", { name: name })} />
          <CardContent>{name}</CardContent>
          <CardActions className="align-items-end justify-content-end">
            <Button
              size="small"
              onClick={(e) => {
                if (processing) return;
                setShouldOpenRemoveModal(false);
              }}
              startIcon={<ExitToAppIcon />}
              variant="contained"
              disableElevation
            >
              {t("btn.close")} (Esc)
            </Button>
            <Button
              className={processing ? "button-loading" : ""}
              size="small"
              onClick={handleDelete}
              variant="contained"
              color="secondary"
              startIcon={processing ? <LoopIcon /> : <DeleteIcon />}
            >
              {t("btn.delete")} (f10)
            </Button>
          </CardActions>
        </Card>
      </Dialog>

      <Dialog
        maxWidth="xs"
        fullWidth={true}
        TransitionProps={{
          addEndListener: (node, done) => {
            // use the css transitionend event to mark the finish of a transition
            node.addEventListener("keypress", function (e) {
              if (e.key === "Enter") {
                handleLock();
              }
            });
          },
        }}
        open={shouldOpenLockModal}
        onClose={(e) => {
          if (processing) return;
          setShouldOpenLockModal(false);
        }}
      >
        <Card>
          <CardHeader
            title={
              t(
                lockModal.o_23 === "N"
                  ? "product.block_yn"
                  : "product.unblock_yn"
              ) + "?"
            }
          />
          <CardContent>
            <Grid container className={""} spacing={1}>
              <Grid item xs={12}>
                <TextField
                  fullWidth={true}
                  margin="dense"
                  disabled={true}
                  label={t("product.name")}
                  value={lockModal.o_5}
                  variant="outlined"
                />
              </Grid>
              {lockModal.o_22 === "N" && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth={true}
                    margin="dense"
                    autoComplete="off"
                    autoFocus={true}
                    label={t("product.block_reason")}
                    onChange={(e) => setLockNote(e.target.value)}
                    value={lockNote}
                    variant="outlined"
                  />
                </Grid>
              )}
            </Grid>
          </CardContent>
          <CardActions
            className="align-items-end"
            style={{ justifyContent: "flex-end" }}
          >
            <Button
              size="small"
              onClick={(e) => {
                if (processing) {
                  return;
                }
                setShouldOpenLockModal(false);
                setLockModal({});
                setLockNote("");
              }}
              startIcon={<ExitToAppIcon />}
              variant="contained"
              disableElevation
            >
              {t("btn.close")} (Esc)
            </Button>
            <Button
              className={processing ? "button-loading" : ""}
              size="small"
              onClick={handleLock}
              variant="contained"
              color="secondary"
              startIcon={processing ? <LoopIcon /> : <CheckIcon />}
            >
              {t("btn.agree")}
            </Button>
          </CardActions>
        </Card>
      </Dialog>

      <ProductEdit
        id={id}
        imgValue={imgValue}
        shouldOpenModal={shouldOpenEditModal}
        setShouldOpenModal={setShouldOpenEditModal}
        onRefresh={handleRefresh}
      />
    </>
  );
};

export default ProductList;
