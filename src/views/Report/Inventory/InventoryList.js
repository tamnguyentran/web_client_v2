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

import { tableColumn, searchDefaultModal } from "./Modal/Inventory.modal";
import InventorySearch from "./InventorySearch";
import ExportExcel from "../../../components/ExportExcel";
import DisplayColumn from "../../../components/DisplayColumn";
import Breadcrumb from "../../../components/Breadcrumb/View";

import {
  Wrapper,
  ButtonCpn,
} from "../../../basicComponents";

const serviceInfo = {
  GET_ALL: {
    functionName: "inven_lotno",
    reqFunct: reqFunction.REPORT_INVENTORY_LOTNO,
    biz: "report",
    object: "rp_inventory",
  },
};

const InventoryList = () => {
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
      glb_sv.defaultValueSearch,
      "ZZZ",
      searchModal.group_id,
      searchModal.invent_yn
    );
  }, []);

  const getList = (last_product_id, last_lot_no_id, group_id, invent_yn) => {
    setSearchProcess(true);
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
      glb_sv.defaultValueSearch,
      "ZZZ",
      searchObject.group_id || 0,
      searchObject.invent_yn || "Y"
    );
  };

  const getNextData = () => {
    if (dataSourceRef.current.length > 0) {
      const lastIndex = dataSourceRef.current.length - 1;
      const lastProductID = dataSourceRef.current[lastIndex].o_1;
      const lastLotNo = dataSourceRef.current[lastIndex].o_3;
      getList(
        lastProductID,
        lastLotNo,
        searchModal.group_id || 0,
        searchModal.invent_yn || "Y"
      );
    }
  };

  const headersCSV = [
    { label: t("stt"), key: "stt" },
    { label: t("product.name"), key: "product_name" },
    { label: t("report.lot_no"), key: "lot_no" },
    { label: t("report.inven_qty"), key: "inven_qty" },
    { label: t("report.imp_qty"), key: "imp_qty" },
    { label: t("report.exp_qty"), key: "exp_qty" },
    { label: t("report.exp_qty_rp"), key: "exp_qty_rp" },
    { label: t("report.exp_qty_cacl"), key: "exp_qty_cacl" },
    // { label: t('createdUser'), key: 'createdUser' },
    // { label: t('createdDate'), key: 'createdDate' },
    // { label: t('titleBranch'), key: 'titleBranch' }
  ];

  const dataCSV = () => {
    const result = dataSource.map((item, index) => {
      const data = item;
      item = {};
      item["stt"] = index + 1;
      item["product_name"] = data.o_2;
      item["lot_no"] = data.o_3;
      item["inven_qty"] = data.o_5;
      item["imp_qty"] = data.o_6;
      item["exp_qty"] = data.o_7;
      item["exp_qty_rp"] = data.o_8;
      item["exp_qty_cacl"] = data.o_9;
      // item['createdUser'] = data.o_19
      // item['createdDate'] = glb_sv.formatValue(data.o_20, 'date')
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
              <InventorySearch
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
              <Breadcrumb description="Đây là trang giúp bạn tìm kiếm, xem thông tin tồn kho của sản phẩm" />
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
              filename="Tồn kho"
              data={dataCSV()}
              headers={headersCSV}
            />
          </Wrapper.WrapperFooter>
        </Wrapper.WrapperTable>
      </div>
    </>
  );
};

export default InventoryList;
