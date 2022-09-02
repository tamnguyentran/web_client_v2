import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";

import glb_sv from "../../../utils/service/global_service";
import control_sv from "../../../utils/service/control_services";
import SnackBarService from "../../../utils/service/snackbar_service";
import reqFunction from "../../../utils/constan/functions";
import sendRequest from "../../../utils/service/sendReq";

import { tableColumn, searchDefaultModal } from "./Modal/ExportDestroy.modal";
import ExportDestroySearch from "./ExportDestroySearch";

import moment from "moment";
import ExportExcel from "../../../components/ExportExcel";
import DisplayColumn from "../../../components/DisplayColumn";
import Breadcrumb from "../../../components/Breadcrumb/View";
import {
  Wrapper,
  ButtonCpn,
} from "../../../basicComponents";

const serviceInfo = {
  GET_ALL: {
    functionName: "exp_destroy_time",
    reqFunct: reqFunction.REPORT_EXPORT_DESTROY,
    biz: "report",
    object: "rp_exp_destroy",
  },
};

const ExportDestroyList = () => {
  const { t } = useTranslation();
  // const [anChorEl, setAnChorEl] = useState(null);
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
      searchModal.reason_tp,
      searchModal.invoice_no,
      searchModal.invoice_status,
      searchModal.product_id,
      glb_sv.defaultValueSearch,
      glb_sv.defaultValueSearch
    );
  }, []);

  const getList = (
    startDate,
    endDate,
    reason_tp,
    invoice_no,
    invoice_status,
    product_id,
    last_invoice_id,
    last_invoice_detail_id
  ) => {
    setSearchProcess(true);
    const inputParam = [
      startDate,
      endDate,
      reason_tp,
      invoice_no,
      invoice_status,
      product_id,
      last_invoice_id || glb_sv.defaultValueSearch,
      last_invoice_detail_id || glb_sv.defaultValueSearch,
    ];
    console.log(inputParam)
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
        if (
          reqInfoMap.inputParam[6] === glb_sv.defaultValueSearch &&
          reqInfoMap.inputParam[7] === glb_sv.defaultValueSearch
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

  // const onClickColumn = (e) => {
  //   setAnChorEl(e.currentTarget);
  // };

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

  const searchSubmit = (searchObject) => {
    dataSourceRef.current = [];
    setSearchModal({ ...searchObject });
    setTotalRecords(0);
    getList(
      moment(searchObject.start_dt).format("YYYYMMDD"),
      moment(searchObject.end_dt).format("YYYYMMDD"),
      searchObject.reason_tp,
      searchObject.invoice_no.trim() !== ""
        ? searchObject.invoice_no.trim()
        : "%",
      searchObject.invoice_status,
      !!searchObject.product_id && searchObject.product_id !== 0
        ? searchObject.product_id
        : 0,
      glb_sv.defaultValueSearch,
      glb_sv.defaultValueSearch
    );
  };

  const getNextData = () => {
    if (dataSourceRef.current.length > 0) {
      const lastIndex = dataSourceRef.current.length - 1;
      const lastInvoiceID = dataSourceRef.current[lastIndex].o_1;
      const lastInvoiceDetailID = dataSourceRef.current[lastIndex].o_5;
      getList(
        moment(searchModal.start_dt).format("YYYYMMDD"),
        moment(searchModal.end_dt).format("YYYYMMDD"),
        searchModal.reason_tp,
        searchModal.invoice_no.trim() !== ""
          ? searchModal.invoice_no.trim()
          : "%",
        searchModal.invoice_status,
        !!searchModal.product_id && searchModal.product_id !== 0
          ? searchModal.product_id
          : 0,
        lastInvoiceID,
        lastInvoiceDetailID
      );
    }
  };

  const headersCSV = [
    { label: t("stt"), key: "stt" },
    { label: t("invoice_no"), key: "invoice_no" },
    { label: t("order.import.order_dt"), key: "order_dt" },
    { label: t("product.name"), key: "product_name" },
    { label: t("order.import.lot_no"), key: "lot_no" },
    { label: t("order.export.qty"), key: "qty" },
    { label: t("order.import.unit_nm"), key: "unit_nm" },
    { label: t("order.import.price"), key: "price" },
    { label: t("order.import.vals"), key: "vals" },
    { label: t("report.reason_tp_nm"), key: "reason_tp_nm" },
    { label: t("createdUser"), key: "createdUser" },
    { label: t("createdDate"), key: "createdDate" },
    // { label: t('titleBranch'), key: 'titleBranch' }
  ];

  const dataCSV = () => {
    const result = dataSource.map((item, index) => {
      const data = item;
      item = {};
      item["stt"] = index + 1;
      item["invoice_no"] = data.o_2;
      item["order_dt"] = glb_sv.formatValue(data.o_4, "dated");
      item["product_name"] = data.o_6;
      item["lot_no"] = data.o_7;
      item["qty"] = data.o_8;
      item["unit_nm"] = data.o_10;
      item["price"] = data.o_11;
      item["vals"] = data.o_12;
      item["reason_tp_nm"] = data.o_14;
      item["createdUser"] = data.o_15;
      item["createdDate"] = glb_sv.formatValue(data.o_16, "date");
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
              <ExportDestroySearch
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
              <Breadcrumb description="Đây là trang giúp bạn tìm kiếm, xem thông tin xuất huỷ của sản phẩm" />
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
              filename="Xuất huỷ"
              data={dataCSV()}
              headers={headersCSV}
            />
          </Wrapper.WrapperFooter>
        </Wrapper.WrapperTable>
      </div>
    </>
  );
};

export default ExportDestroyList;
