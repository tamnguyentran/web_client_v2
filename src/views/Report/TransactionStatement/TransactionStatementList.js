import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import FastForwardIcon from "@material-ui/icons/FastForward";
import Chip from "@material-ui/core/Chip";
import ColumnCtrComp from "../../../components/_ColumnCtr";

import glb_sv from "../../../utils/service/global_service";
import control_sv from "../../../utils/service/control_services";
import SnackBarService from "../../../utils/service/snackbar_service";
import reqFunction from "../../../utils/constan/functions";
import sendRequest from "../../../utils/service/sendReq";

import {
  tableColumn,
  searchDefaultModal,
} from "./Modal/TransactionStatement.modal";
import TransactionStatementSearch from "./TransactionStatementSearch";
import {
  Card,
  CardHeader,
  CardContent,
  IconButton,
  Tooltip,
  Grid,
  CardActions,
} from "@material-ui/core";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import moment from "moment";
import ExportExcel from "../../../components/ExportExcel";
import DisplayColumn from "../../../components/DisplayColumn";
import Breadcrumb from "../../../components/Breadcrumb/View";
import {
  TitleFilterCpn,
  Wrapper,
  IconButtonCpn,
  ButtonCpn,
} from "../../../basicComponents";

const serviceInfo = {
  GET_ALL: {
    functionName: "state_prod",
    reqFunct: reqFunction.REPORT_TRANSACTION_STATEMENT,
    biz: "report",
    object: "rp_statement",
  },
};

const TransactionStatementList = () => {
  const { t } = useTranslation();
  const [anChorEl, setAnChorEl] = useState(null);
  const [column, setColumn] = useState(tableColumn);
  const [searchModal, setSearchModal] = useState({ ...searchDefaultModal });
  const [totalRecords, setTotalRecords] = useState(0);
  const [dataSource, setDataSource] = useState([]);
  const [searchProcess, setSearchProcess] = useState(false);
  const [isShowLayout, setIsShowLayout] = useState(false);

  const dataSourceRef = useRef([]);

  useEffect(() => {
    getList(
      searchModal.start_dt,
      searchModal.end_dt,
      searchModal.product_id,
      glb_sv.defaultValueSearch
    );
  }, []);

  const getList = (startdate, endDate, product_id, lastID) => {
    setSearchProcess(true);
    const inputParam = [
      startdate,
      endDate,
      product_id,
      lastID || glb_sv.defaultValueSearch,
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
        if (reqInfoMap.inputParam[3] === glb_sv.defaultValueSearch) {
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

  //-- xử lý khi timeout -> ko nhận được phản hồi từ server
  const handleTimeOut = (e) => {
    SnackBarService.alert(t(`message.${e.type}`), true, 4, 3000);
    setSearchProcess(false);
  };

  const onClickColumn = (e) => {
    setAnChorEl(e.currentTarget);
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

  const searchSubmit = (searchObject) => {
    dataSourceRef.current = [];
    setSearchModal({ ...searchObject });
    setTotalRecords(0);
    getList(
      moment(searchObject.start_dt).format("YYYYMMDD"),
      moment(searchObject.end_dt).format("YYYYMMDD"),
      !!searchObject.product_id && searchObject.product_id !== 0
        ? searchObject.product_id
        : 0,
      glb_sv.defaultValueSearch
    );
  };

  const getNextData = () => {
    if (dataSourceRef.current.length > 0) {
      const lastIndex = dataSourceRef.current.length - 1;
      const lastInvoiceID = dataSourceRef.current[lastIndex].o_1;
      getList(
        moment(searchModal.start_dt).format("YYYYMMDD"),
        moment(searchModal.end_dt).format("YYYYMMDD"),
        !!searchModal.product_id && searchModal.product_id !== 0
          ? searchModal.product_id
          : 0,
        lastInvoiceID
      );
    }
  };

  const headersCSV = [
    { label: t("stt"), key: "stt" },
    { label: t("menu.product"), key: "product" },
    { label: t("report.trans_dt"), key: "trans_dt" },
    { label: t("report.s_inven_qty"), key: "s_inven_qty" },
    { label: t("report.trans_nm"), key: "trans_nm" },
    { label: t("report.qty"), key: "qty" },
    { label: t("report.unit"), key: "unit" },
    { label: t("report.e_inven_qty"), key: "e_inven_qty" },
    { label: t("createdUser"), key: "createdUser" },
    { label: t("createdDate"), key: "createdDate" },
    // { label: t('titleBranch'), key: 'titleBranch' }
  ];

  const dataCSV = () => {
    const result = dataSource.map((item, index) => {
      const data = item;
      item = {};
      item["stt"] = index + 1;
      item["product"] = data.o_2;
      item["s_inven_qty"] = data.o_3;
      item["trans_dt"] = glb_sv.formatValue(data.o_4, "dated");
      item["trans_nm"] = data.o_5;
      item["qty"] = data.o_6;
      item["unit"] = data.o_7;
      item["e_inven_qty"] = data.o_8;
      item["createdUser"] = data.o_9;
      item["createdDate"] = glb_sv.formatValue(data.o_10, "date");
      // item['titleBranch'] = data.o_9
      return item;
    });
    return result;
  };

  return (
    <>
      <div className="layout-page p-2">
        <Wrapper.WrapperFilter isShowLayout={isShowLayout}>
          <div className="p-2">
            <div className="mb-4">
              <TransactionStatementSearch
                process={searchProcess}
                handleSearch={searchSubmit}
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
              <Breadcrumb description="Đây là trang giúp bạn tìm kiếm, xem thông tin sao kê giao dịch của sản phẩm" />
            </div>
            <div className="flex">
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
                      >
                        {t(col.title)}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dataSource.map((item, index) => {
                    return (
                      <TableRow
                        className="table-row-p8"
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
              filename="Sao kê giao dịch"
              data={dataCSV()}
              headers={headersCSV}
            />
          </Wrapper.WrapperFooter>
        </Wrapper.WrapperTable>
      </div>
      {false && (
        <>
          <Card className="mb-2">
            <CardHeader
              title={
                <div className="flex aligh-item-center">{<Breadcrumb />}</div>
              }
            />
            <CardContent>
              <TransactionStatementSearch
                process={searchProcess}
                handleSearch={searchSubmit}
              />
            </CardContent>
          </Card>
          <ColumnCtrComp
            anchorEl={anChorEl}
            columns={tableColumn}
            handleClose={onCloseColumn}
            checkColumnChange={onChangeColumnView}
          />
          <Card>
            <CardHeader
              title={
                <>
                  {t("transaction_statement_list")}
                  <DisplayColumn
                    columns={tableColumn}
                    handleCheckChange={onChangeColumnView}
                  />
                </>
              }
            />
            <CardContent>
              <TableContainer className="height-table-260 tableContainer">
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
                      return (
                        <TableRow
                          className="table-row-p8"
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
                  filename="report-transaction-statement"
                  data={dataCSV()}
                  headers={headersCSV}
                />
              </div>
            </CardActions>
          </Card>
        </>
      )}
    </>
  );
};

export default TransactionStatementList;
