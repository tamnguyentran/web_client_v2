import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  Button,
  Chip,
  IconButton,
} from "@material-ui/core";

import FastForwardIcon from "@material-ui/icons/FastForward";
import EditIcon from "@material-ui/icons/Edit";
import LoopIcon from "@material-ui/icons/Loop";

import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import DeleteIcon from "@material-ui/icons/Delete";
import SearchOne from "../../../components/SearchOne";
import ColumnCtrComp from "../../../components/_ColumnCtr";
import ExportExcel from "../../../components/ExportExcel";
import DisplayColumn from "../../../components/DisplayColumn";

import glb_sv from "../../../utils/service/global_service";
import control_sv from "../../../utils/service/control_services";
import SnackBarService from "../../../utils/service/snackbar_service";
import sendRequest from "../../../utils/service/sendReq";

import { tableColumn, config } from "./Modal/UnitRate.modal";
import UnitRateAdd from "./UnitRateAdd";
import UnitRateEdit from "./UnitRateEdit";
import Breadcrumb from "../../../components/Breadcrumb/View";
import { Unit } from "../../../components/Autocomplete";
import { ReactComponent as IC_SHAPE } from "../../../asset/images/shape.svg";
import UnitRateRemote from "./UnitRateRemote";
import {
  TitleFilterCpn,
  Wrapper,
  IconButtonCpn,
  ButtonCpn,
} from "../../../basicComponents";

const serviceInfo = {
  GET_ALL: {
    functionName: config["list"].functionName,
    reqFunct: config["list"].reqFunct,
    biz: config.biz,
    object: config.object,
  },
  CREATE: {
    functionName: config["insert"].functionName,
    reqFunct: config["insert"].reqFunct,
    biz: config.biz,
    object: config.object,
  },
  UPDATE: {
    functionName: config["update"].functionName,
    reqFunct: config["update"].reqFunct,
    biz: config.biz,
    object: config.object,
  },
  DELETE: {
    functionName: config["delete"].functionName,
    reqFunct: config["delete"].reqFunct,
    biz: config.biz,
    object: config.object,
  },
};

const UnitRateList = () => {
  const { t } = useTranslation();
  const [anChorEl, setAnChorEl] = useState(null);
  const [column, setColumn] = useState(tableColumn);
  const [searchValue, setSearchValue] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const [dataSource, setDataSource] = useState([]);

  const [shouldOpenEditModal, setShouldOpenEditModal] = useState(false);
  const [shouldOpenRemoveModal, setShouldOpenRemoveModal] = useState(false);
  const [id, setId] = useState(0);
  const [name, setName] = useState("");
  const [processing, setProcessing] = useState(false);
  const [searchProcess, setSearchProcess] = useState(false);

  const [isShowLayout, setIsShowLayout] = useState(false);

  const dataSourceRef = useRef([]);
  const searchRef = useRef("");
  const idRef = useRef(0);

  useEffect(() => {
    getList(glb_sv.defaultValueSearch, "");
  }, []);

  const getList = (lastIndex, value) => {
    const inputParam = [lastIndex, "%" + value.trim() + "%"];
    setSearchProcess(true);
    sendRequest(
      serviceInfo.GET_ALL,
      inputParam,
      handleResultGetList,
      true,
      handleTimeOut
    );
  };

  const handleResultGetList = (reqInfoMap, message) => {
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
      setShouldOpenRemoveModal(false);
      getList(glb_sv.defaultValueSearch, searchValue);
    }
  };

  //-- xử lý khi timeout -> ko nhận được phản hồi từ server
  const handleTimeOut = (e) => {
    SnackBarService.alert(t(`message.${e.type}`), true, 4, 3000);
    setProcessing(false);
    setSearchProcess(false);
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
    setName(
      item
        ? item.o_3 + ": " + item.o_5 + " - " + item.o_6 + " - " + item.o_8
        : ""
    );
  };

  const onEdit = (item) => {
    setShouldOpenEditModal(item ? true : false);
    setId(item ? item.o_1 : 0);
    idRef.current = item && item.o_1 > 0 ? item.item && item.o_1 > 0 : 0;
  };

  const handleDelete = (e) => {
    // e.preventDefault();
    // idRef.current = id;
    sendRequest(
      serviceInfo.DELETE,
      [id],
      handleResultRemove,
      true,
      handleTimeOut
    );
    setProcessing(true);
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
    { label: t("menu.product"), key: "product" },
    { label: t("menu.configUnit"), key: "unit" },
    { label: t("config.unitRate.rate"), key: "rate" },
    { label: t("config.unitRate.minRate"), key: "minRate" },
    { label: t("createdUser"), key: "createdUser" },
    { label: t("createdDate"), key: "createdDate" },
    { label: t("titleBranch"), key: "titleBranch" },
  ];

  const dataCSV = () => {
    const result = dataSource.map((item, index) => {
      const data = item;
      item = {};
      item["stt"] = index + 1;
      item["product"] = data.o_3;
      item["unit"] = data.o_5;
      item["rate"] = data.o_6;
      item["minRate"] = data.o_8;
      item["createdUser"] = data.o_9;
      item["createdDate"] = glb_sv.formatValue(data.o_10, "date");
      item["titleBranch"] = data.o_11;
      return item;
    });
    return result;
  };

  const handleRefresh = () => {
    dataSourceRef.current = [];
    setTotalRecords(0);
    getList(glb_sv.defaultValueSearch, searchValue);
  };

  return (
    <>
      <div className="layout-page p-2">
        <Wrapper.WrapperFilter isShowLayout={isShowLayout}>
          <div className="p-2">
            <div className="mb-4">
              <TitleFilterCpn className="mb-2" label="Tìm kiếm" />
              <SearchOne
                process={searchProcess}
                // name="unit_name"
                label={"Tên sản phẩm"}
                searchSubmit={searchSubmit}
                itemGrd={3}
              />
            </div>
          </div>
        </Wrapper.WrapperFilter>
        <Wrapper.WrapperTable
          isShowLayout={isShowLayout}
          setIsShowLayout={setIsShowLayout}
        >
          <Wrapper.WrapperHeader>
            <div>
              <Breadcrumb description="Đây là trang giúp bạn tìm kiếm, thiết lập hệ số quy đổi đơn vị cho sản phẩm" />
            </div>
            <div className="flex">
              <UnitRateAdd onRefresh={handleRefresh} />
              &ensp;
              <DisplayColumn
                columns={tableColumn}
                handleCheckChange={onChangeColumnView}
              />
            </div>
          </Wrapper.WrapperHeader>
          <Wrapper.WrapperContent>
            <TableContainer className="table-list-layout">
              <Table stickyHeader>
                <caption
                  className={[
                    "text-center text-danger border-bottom",
                    dataSource.length > 0 && "dl-none",
                  ].join(" ")}
                >
                  {t("lbl.emptyData")}
                </caption>
                <TableHead>
                  <TableRow>
                    {column.map((col) => (
                      <TableCell
                        nowrap="true"
                        className={`p-2 text-uppercase text-black ${
                          !col.show && "dl-none"
                        }`}
                        key={col.field}
                        align={col.align}
                      >
                        {t(col.title)}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dataSource.map((item, index) => {
                    return (
                      <TableRow hover role="checkbox" tabIndex={-1} key={index}>
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
                                    <IconButtonCpn.IconButtonEdit
                                      onClick={() => {
                                        onEdit(item);
                                      }}
                                    />
                                    <IconButtonCpn.IconButtonTrash
                                      onClick={() => {
                                        onRemove(item);
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
          </Wrapper.WrapperContent>
          <Wrapper.WrapperFooter>
            <ButtonCpn.ButtonGetMoreData
              onClick={getNextData}
              totalRecords={totalRecords}
              displayRecords={dataSourceRef.current.length}
              disabled={dataSourceRef.current.length >= totalRecords}
            />
            <ExportExcel
              filename="Hệ số quy đổi"
              data={dataCSV()}
              headers={headersCSV}
            />
          </Wrapper.WrapperFooter>
        </Wrapper.WrapperTable>
      </div>
      {/* modal delete */}
      <UnitRateRemote
        name={name}
        shouldOpenRemoveModal={shouldOpenRemoveModal}
        setShouldOpenRemoveModal={setShouldOpenRemoveModal}
        processing={processing}
        handleDelete={handleDelete}
      />
      <UnitRateEdit
        id={id}
        shouldOpenModal={shouldOpenEditModal}
        setShouldOpenModal={setShouldOpenEditModal}
        onRefresh={handleRefresh}
      />
    </>
  );
};

export default UnitRateList;
