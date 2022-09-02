import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from "@material-ui/core";

import SearchOne from "../../../components/SearchOne";
import ExportExcel from "../../../components/ExportExcel";
import DisplayColumn from "../../../components/DisplayColumn";

import glb_sv from "../../../utils/service/global_service";
import control_sv from "../../../utils/service/control_services";
import SnackBarService from "../../../utils/service/snackbar_service";
import sendRequest from "../../../utils/service/sendReq";

import { tableColumn, config } from "./Modal/WarnTime.modal";
import WarnTimeAdd from "./WarnTimeAdd";
import WarnTimeEdit from "./WarnTimeEdit";
import WarnTimeRemove from "./WarnTimeRemove";
import Breadcrumb from "../../../components/Breadcrumb/View";
import { useHotkeys } from "react-hotkeys-hook";
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
  DELETE: {
    functionName: config["delete"].functionName,
    reqFunct: config["delete"].reqFunct,
    biz: config.biz,
    object: config.object,
  },
};

const WarnTimeList = () => {
  const { t } = useTranslation();
  // const [anChorEl, setAnChorEl] = useState(null);
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

  useHotkeys(
    "F10",
    () => {
      handleDelete();
    },
    { enableOnTags: ["INPUT", "SELECT", "TEXTAREA"] }
  );

  useHotkeys(
    "esc",
    () => {
      if (processing) return;
      setShouldOpenRemoveModal(false);
    },
    { enableOnTags: ["INPUT", "SELECT", "TEXTAREA"] }
  );

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
        if (reqInfoMap.inputParam[0] === glb_sv.defaultValueSearch) {
          setTotalRecords(newData.rowTotal);
        } else {
          setTotalRecords(
            dataSourceRef.current.length -
              newData.rows.length +
              newData.rowTotal
          );
        }
        dataSourceRef.current = dataSourceRef.current.concat(newData.rows);
        setDataSource(dataSourceRef.current);
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

  // const onCloseColumn = () => {
  //   setAnChorEl(null);
  // };

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
    setName(item ? item.o_3 + " (" + item.o_4 + " - " + item.o_6 + ")" : "");
  };

  const onEdit = (item) => {
    setShouldOpenEditModal(item ? true : false);
    setId(item ? item.o_1 : 0);
    idRef.current = item && item.o_1 > 0 ? item.item && item.o_1 > 0 : 0;
  };

  const handleDelete = (e) => {
    // e.preventDefault();
    setProcessing(true);
    idRef.current = id;
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
    { label: t("menu.product"), key: "product" },
    { label: t("config.warnTime.warn_amt"), key: "warn_amt" },
    { label: t("config.warnTime.warn_amt_tp"), key: "warn_amt_tp" },
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
      item["warn_amt"] = data.o_4;
      item["warn_amt_tp"] = data.o_6;
      item["createdUser"] = data.o_7;
      item["createdDate"] = glb_sv.formatValue(data.o_8, "date");
      item["titleBranch"] = data.o_9;
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
              <Breadcrumb description="Đây là trang giúp bạn tìm kiếm, thiết lập cảnh báo hạn sử dụng cho sản phẩm" />
            </div>
            <div className="flex">
              <WarnTimeAdd onRefresh={handleRefresh} />
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
              filename="Mốc cảnh báo trước HSD"
              data={dataCSV()}
              headers={headersCSV}
            />
          </Wrapper.WrapperFooter>
        </Wrapper.WrapperTable>
        <WarnTimeEdit
          id={id}
          shouldOpenModal={shouldOpenEditModal}
          setShouldOpenModal={setShouldOpenEditModal}
          onRefresh={handleRefresh}
        />
        <WarnTimeRemove
          shouldOpenRemoveModal={shouldOpenRemoveModal}
          setShouldOpenRemoveModal={setShouldOpenRemoveModal}
          processing={processing}
          handleDelete={handleDelete}
          name={name}
        />
      </div>
    </>
  );
};

export default WarnTimeList;
