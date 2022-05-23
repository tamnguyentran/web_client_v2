import React, { useState, useRef, useEffect } from "react";
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
} from "@material-ui/core";
import CancelOutlinedIcon from "@material-ui/icons/CancelOutlined";
import FastForwardIcon from "@material-ui/icons/FastForward";
import EditIcon from "@material-ui/icons/Edit";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import SaveIcon from "@material-ui/icons/Save";
import CheckIcon from "@material-ui/icons/Check";
import DeleteIcon from "@material-ui/icons/Delete";
import ColumnCtrComp from "../../../components/_ColumnCtr";

import glb_sv from "../../../utils/service/global_service";
import control_sv from "../../../utils/service/control_services";
import SnackBarService from "../../../utils/service/snackbar_service";
import sendRequest from "../../../utils/service/sendReq";

import { tableColumn, config } from "./Modal/ProductGroup.modal";
import ProductGroupAdd from "./ProductGroupAdd";
import ProductGroupEdit from "./ProductGroupEdit";
import SearchOne from "../../../components/SearchOne";
import LoopIcon from "@material-ui/icons/Loop";
import ExportExcel from "../../../components/ExportExcel";
import DisplayColumn from "../../../components/DisplayColumn";
import Breadcrumb from "../../../components/Breadcrumb/View";

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

const ProductGroupList = () => {
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
    setName(item ? item.o_2 : "");
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
    { label: t("productGroup.name"), key: "name" },
    { label: t("productGroup.note"), key: "note" },
    { label: t("productGroup.main_group"), key: "main_group" },
    { label: t("createdUser"), key: "createdUser" },
    { label: t("createdDate"), key: "createdDate" },
    { label: t("titleBranch"), key: "titleBranch" },
  ];

  const dataCSV = () => {
    const result = dataSource.map((item, index) => {
      const data = item;
      item = {};
      item["stt"] = index + 1;
      item["name"] = data.o_2;
      item["note"] = data.o_3;
      item["main_group"] =
        data.o_4 === "Y" ? t("productGroup.isMain") : t("productGroup.notMain");
      item["createdUser"] = data.o_5;
      item["createdDate"] = glb_sv.formatValue(data.o_6, "date");
      item["titleBranch"] = data.o_7;
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
      <Card className="mb-2">
      <CardHeader
          title={<div className="flex aligh-item-center">{<Breadcrumb />}</div>}
        />
        <CardContent>
          <SearchOne
            process={searchProcess}
            name="product_name"
            label={"product.search_namedd"}
            searchSubmit={searchSubmit}
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
              {t("productGroup.titleList")}
              {/* < IconButton className='ml-2' style={{ padding: 0, backgroundColor: '#fff' }} onClick={onClickColumn}>
                                <MoreVertIcon />
                            </IconButton> */}
              <DisplayColumn
                columns={tableColumn}
                handleCheckChange={onChangeColumnView}
              />
            </>
          }
          action={
            <div className="d-flex align-items-center">
              <ProductGroupAdd onRefresh={handleRefresh} />
            </div>
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
                  {column?.map((col) => (
                    <TableCell
                      nowrap="true"
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
                {dataSource?.length > 0
                  ? dataSource?.map((item, index) => {
                      return (
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
                                        <EditIcon fontSize="small" />
                                      </IconButton>
                                    </TableCell>
                                  );
                                case "o_4":
                                  return (
                                    <TableCell
                                      nowrap="true"
                                      key={indexRow}
                                      align={col.align}
                                    >
                                      {value === "Y"
                                        ? t("productGroup.isMain")
                                        : t("productGroup.notMain")}
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
                    })
                  : null}
              </TableBody>
            </Table>
          </TableContainer>
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
                t("rowData")
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
            <ExportExcel
              filename="product_group"
              data={dataCSV()}
              headers={headersCSV}
              style={{ backgroundColor: "#00A248", color: "#066190" }}
            />
          </div>
        </CardActions>
      </Card>

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
          setShouldOpenRemoveModal(false);
        }}
      >
        <Card>
          <CardHeader title={t("productGroup.titleRemove", { name: name })} />
          <CardContent>
            {t("productGroup.name")}: {name}
          </CardContent>
          <CardActions
            className="align-items-end"
            style={{ justifyContent: "flex-end" }}
          >
            <Button
              size="small"
              onClick={(e) => {
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
              endIcon={processing && <LoopIcon />}
              size="small"
              onClick={handleDelete}
              variant="contained"
              color="secondary"
              startIcon={<DeleteIcon />}
            >
              {t("btn.delete")} (f10)
            </Button>
          </CardActions>
        </Card>
      </Dialog>

      <ProductGroupEdit
        id={id}
        shouldOpenModal={shouldOpenEditModal}
        setShouldOpenModal={setShouldOpenEditModal}
        onRefresh={handleRefresh}
      />
    </>
  );
};

export default ProductGroupList;
