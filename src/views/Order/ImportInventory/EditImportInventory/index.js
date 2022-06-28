import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import {
  Grid,
  Table,
  TableBody,
  TableContainer,
  TableCell,
  TableHead,
  TableRow,
  Button,
  TextField,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Dialog,
} from "@material-ui/core";
import NumberFormat from "react-number-format";
import IconButton from "@material-ui/core/IconButton";
import CancelOutlinedIcon from "@material-ui/icons/CancelOutlined";
import EditIcon from "@material-ui/icons/Edit";
import LoopIcon from "@material-ui/icons/Loop";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import SaveIcon from "@material-ui/icons/Save";
import CheckIcon from "@material-ui/icons/Check";
import DeleteIcon from "@material-ui/icons/Delete";

import glb_sv from "../../../../utils/service/global_service";
import control_sv from "../../../../utils/service/control_services";
import SnackBarService from "../../../../utils/service/snackbar_service";
import reqFunction from "../../../../utils/constan/functions";
import sendRequest from "../../../../utils/service/sendReq";

import {
  tableListEditColumn,
  invoiceImportInventoryModal,
} from "../Modal/ImportInventory.modal";
import moment from "moment";

import EditProductRows from "./EditProductRows";
import AddProductClone from "../AddProductClone";
import { useReactToPrint } from "react-to-print";
import Import_Inventory_Bill from "../../../../components/Bill/Import_Inventory_Bill";
import ExportExcel from "../../../../components/ExportExcel";

const serviceInfo = {
  GET_INVOICE_BY_ID: {
    functionName: "get_by_id",
    reqFunct: reqFunction.IMPORT_BY_ID,
    biz: "import",
    object: "imp_inventory",
  },
  GET_ALL_PRODUCT_BY_IMPORT_INVENTORY_ID: {
    functionName: "get_all",
    reqFunct: reqFunction.GET_ALL_PRODUCT_BY_IMPORT_INVENTORY_ID,
    biz: "import",
    object: "imp_inventory_dt",
  },
  ADD_PRODUCT_TO_INVOICE: {
    functionName: "insert",
    reqFunct: reqFunction.PRODUCT_IMPORT_INVOICE_CREATE,
    biz: "import",
    object: "imp_inventory_dt",
  },
  DELETE_PRODUCT_TO_INVOICE: {
    functionName: "delete",
    reqFunct: reqFunction.PRODUCT_IMPORT_INVOICE_DELETE,
    biz: "import",
    object: "imp_inventory_dt",
  },
};

const EditImportInventory = ({}) => {
  const { t } = useTranslation();
  const history = useHistory();
  const { id } = history?.location?.state || 0;
  const [ImportInventory, setImportInventory] = useState({
    ...invoiceImportInventoryModal,
  });
  const [dataSource, setDataSource] = useState([]);
  const [productEditID, setProductEditID] = useState(-1);
  const [column, setColumn] = useState([...tableListEditColumn]);
  const [productDeleteIndex, setProductDeleteIndex] = useState(null);
  const [productDeleteModal, setProductDeleteModal] = useState({});
  const [shouldOpenDeleteModal, setShouldOpenDeleteModal] = useState(false);
  const [deleteProcess, setDeleteProcess] = useState(false);
  const [resetFormAddFlag, setResetFormAddFlag] = useState(false);

  const componentPrint = useRef(null);
  const newInvoiceID = useRef(-1);

  useEffect(() => {
    if (id !== 0) {
      sendRequest(
        serviceInfo.GET_INVOICE_BY_ID,
        [id],
        handleResultGetInvoiceByID,
        true,
        handleTimeOut
      );
      sendRequest(
        serviceInfo.GET_ALL_PRODUCT_BY_IMPORT_INVENTORY_ID,
        [id],
        handleGetAllProductByInvoiceID,
        true,
        handleTimeOut
      );
    }
    return () => {
      history.replace({
        ...history?.location,
        state: undefined,
      });
    };
  }, []);

  const handleResultGetInvoiceByID = (reqInfoMap, message) => {
    if (message["PROC_STATUS"] !== 1) {
      // xử lý thất bại
      const cltSeqResult = message["REQUEST_SEQ"];
      glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap);
      control_sv.clearReqInfoMapRequest(cltSeqResult);
    } else if (message["PROC_DATA"]) {
      // xử lý thành công
      let newData = message["PROC_DATA"];
      newInvoiceID.current = newData.rows[0].o_1;
      let dataImportInventory = {
        invoice_id: newData.rows[0].o_1,
        invoice_no: newData.rows[0].o_2,
        invoice_stat: newData.rows[0].o_3,
        total_prod: newData.rows[0].o_4,
        total_val: newData.rows[0].o_5,
        cancel_reason: newData.rows[0].o_6,
        note: newData.rows[0].o_7,
        input_dt: moment(newData.rows[0].o_8, "YYYYMMDD").toString(),
      };
      setImportInventory(dataImportInventory);
    }
  };

  const handleGetAllProductByInvoiceID = (reqInfoMap, message) => {
    if (message["PROC_STATUS"] !== 1) {
      // xử lý thất bại
      const cltSeqResult = message["REQUEST_SEQ"];
      glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap);
      control_sv.clearReqInfoMapRequest(cltSeqResult);
    } else if (message["PROC_DATA"]) {
      // xử lý thành công
      let newData = message["PROC_DATA"];
      setDataSource(newData.rows);
    }
  };

  //-- xử lý khi timeout -> ko nhận được phản hồi từ server
  const handleTimeOut = (e) => {
    SnackBarService.alert(t(`message.${e.type}`), true, 4, 3000);
  };

  const handleAddProduct = (productObject) => {
    if (!productObject) {
      SnackBarService.alert(t("wrongData"), true, "error", 3000);
      return;
    }
    const inputParam = [
      ImportInventory.invoice_id || newInvoiceID.current,
      productObject.prod_id,
      productObject.lot_no,
      productObject.unit_id,
      productObject.qty,
      productObject.made_dt
        ? moment(productObject.made_dt).format("YYYYMMDD")
        : "",
      productObject.exp_dt
        ? moment(productObject.exp_dt).format("YYYYMMDD")
        : "",
      productObject.price,
    ];
    sendRequest(
      serviceInfo.ADD_PRODUCT_TO_INVOICE,
      inputParam,
      handleResultAddProduct,
      true,
      handleTimeOut
    );
  };

  const handleResultAddProduct = (reqInfoMap, message) => {
    SnackBarService.alert(
      message["PROC_MESSAGE"],
      true,
      message["PROC_STATUS"],
      3000
    );
    if (message["PROC_STATUS"] !== 1) {
      // xử lý thất bại
      const cltSeqResult = message["REQUEST_SEQ"];
      glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap);
      control_sv.clearReqInfoMapRequest(cltSeqResult);
    } else if (message["PROC_DATA"]) {
      // xử lý thành công
      setResetFormAddFlag(true);
      setTimeout(() => {
        setResetFormAddFlag(false);
      }, 1000);
      sendRequest(
        serviceInfo.GET_ALL_PRODUCT_BY_INVOICE_ID,
        [newInvoiceID.current],
        handleGetAllProductByInvoiceID,
        true,
        handleTimeOut
      );
      sendRequest(
        serviceInfo.GET_INVOICE_BY_ID,
        [newInvoiceID.current],
        handleResultGetInvoiceByID,
        true,
        handleTimeOut
      );
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
    if (!productDeleteModal.o_1 || !productDeleteModal.o_2) return;
    setDeleteProcess(true);
    const inputParam = [productDeleteModal.o_2, productDeleteModal.o_1];
    sendRequest(
      serviceInfo.DELETE_PRODUCT_TO_INVOICE,
      inputParam,
      handleResultDeleteProduct,
      true,
      handleTimeOut
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
      const cltSeqResult = message["REQUEST_SEQ"];
      glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap);
      control_sv.clearReqInfoMapRequest(cltSeqResult);
    } else if (message["PROC_DATA"]) {
      setProductDeleteIndex(null);
      setProductDeleteModal({});
      setShouldOpenDeleteModal(false);
      handleRefresh();
    }
  };

  const checkValidate = () => {
    if (
      dataSource.length > 0 &&
      !!ImportInventory.supplier &&
      !!ImportInventory.order_dt
    ) {
      return false;
    }
    return true;
  };

  const onDoubleClickRow = (rowData) => {
    if (!rowData) {
      SnackBarService.alert(t("wrongData"), true, "error", 3000);
      return;
    }
    setProductEditID(rowData.o_1);
  };

  const handleRefresh = () => {
    sendRequest(
      serviceInfo.GET_ALL_PRODUCT_BY_IMPORT_INVENTORY_ID,
      [newInvoiceID.current],
      handleGetAllProductByInvoiceID,
      true,
      handleTimeOut
    );
    sendRequest(
      serviceInfo.GET_INVOICE_BY_ID,
      [newInvoiceID.current],
      handleResultGetInvoiceByID,
      true,
      handleTimeOut
    );
  };

  const headersCSV = [
    { label: t("stt"), key: "stt" },
    { label: t("order.import.prod_nm"), key: "prod_nm" },
    { label: t("order.import.lot_no"), key: "lot_no" },
    { label: t("order.import.exp_dt"), key: "exp_dt" },
    { label: t("order.import.qty"), key: "qty" },
    { label: t("order.import.unit_nm"), key: "unit_nm" },
    { label: t("order.import.price"), key: "price" },
    { label: t(""), key: "space_01" },
    { label: t("order.import.invoice_no"), key: "invoice_no" },
    { label: t("order.import.note"), key: "note" },
    { label: t("order.import.invoice_val"), key: "invoice_val" },
  ];

  const dataCSV = () => {
    let result = dataSource.map((item, index) => {
      const data = item;
      item = {};
      item["stt"] = index + 1;
      item["prod_nm"] = data.o_5;
      item["lot_no"] = data.o_6;
      item["exp_dt"] = data.o_7
        ? moment(data.o_7, "YYYYMMDD").format("DD/MM/YYYY")
        : "";
      item["qty"] = data.o_8;
      item["unit_nm"] = data.o_10;
      item["price"] = data.o_11;

      item["space_01"] = "";
      item["invoice_no"] = ImportInventory.invoice_no;
      item["invoice_val"] = ImportInventory.total_val;
      item["note"] = ImportInventory.note;
      return item;
    });
    return result;
  };

  const handlePrint = useReactToPrint({
    content: () => componentPrint.current,
  });

  return (
    <Grid container spacing={1}>
      <EditProductRows
        productEditID={productEditID}
        invoiceID={newInvoiceID.current}
        onRefresh={handleRefresh}
        setProductEditID={setProductEditID}
      />
      <Grid item md={9} xs={12}>
        <AddProductClone
          onAddProduct={handleAddProduct}
          resetFlag={resetFormAddFlag}
        />
        <Card>
          <CardHeader
            title={t("order.import.productImportListdd")}
            action={
              <ExportExcel
                filename={`import_inventory_${ImportInventory.invoice_no}`}
                data={dataCSV()}
                headers={headersCSV}
                style={{ backgroundColor: "#00A248", color: "#fff" }}
              />
            }
          />
          <CardContent>
            <TableContainer className="height-table-260 tableContainer tableOrder">
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
                        onDoubleClick={(e) => {
                          onDoubleClickRow(item);
                        }}
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
                                        setProductDeleteIndex(index + 1);
                                      }}
                                    >
                                      <DeleteIcon
                                        style={{ color: "red" }}
                                        fontSize="small"
                                      />
                                    </IconButton>
                                    <IconButton
                                      onClick={(e) => {
                                        onDoubleClickRow(item);
                                      }}
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                  </TableCell>
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
                              case "imp_tp":
                                return (
                                  <TableCell
                                    nowrap="true"
                                    key={indexRow}
                                    align={col.align}
                                  >
                                    {value === "1"
                                      ? t("order.import.import_type_buy")
                                      : t("order.import.import_type_selloff")}
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
        </Card>
      </Grid>
      <Grid item md={3} xs={12}>
        <Card>
          <CardHeader title={t("order.import.invoice_info")} />
          <CardContent>
            <Grid container spacing={1}>
              <TextField
                fullWidth={true}
                margin="dense"
                multiline
                rows={1}
                autoComplete="off"
                label={t("order.import.invoice_no")}
                disabled={true}
                value={ImportInventory.invoice_no || ""}
                name="invoice_no"
                variant="outlined"
              />
              <NumberFormat
                className="inputNumber"
                style={{ width: "100%" }}
                required
                value={
                  dataSource.reduce(function (acc, obj) {
                    return acc + Math.round(obj.o_8 * obj.o_11);
                  }, 0) || 0
                }
                label={t("order.import.invoice_val")}
                customInput={TextField}
                autoComplete="off"
                margin="dense"
                type="text"
                variant="outlined"
                thousandSeparator={true}
                disabled={true}
              />
              <TextField
                disabled={true}
                fullWidth={true}
                margin="dense"
                multiline
                autoComplete="off"
                rows={2}
                rowsMax={5}
                label={t("order.import.note")}
                value={ImportInventory.note || ""}
                name="note"
                variant="outlined"
              />
            </Grid>
            <Grid container spacing={1} className="mt-2">
              <Button
                fullWidth={true}
                onClick={handlePrint}
                className="bg-print text-white"
                id="buttonPrint"
                size="smail"
                variant="contained"
              >
                {t("print")}
              </Button>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      <div className="" style={{ display: "none" }}>
        <Import_Inventory_Bill
          headerModal={ImportInventory}
          detailModal={dataSource}
          componentRef={componentPrint}
        />
      </div>

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
        open={shouldOpenDeleteModal}
        onClose={(e) => {
          setShouldOpenDeleteModal(false);
        }}
      >
        <Card>
          <CardHeader title={t("order.import.productDelete")} />
          <CardContent>
            <Grid container>
              {productDeleteModal.o_4 +
                " - " +
                t("order.import.qty") +
                ": " +
                productDeleteModal.o_8 +
                " " +
                productDeleteModal.o_10 +
                " (" +
                t("stt") +
                " " +
                productDeleteIndex +
                ")"}
            </Grid>
          </CardContent>
          <CardActions
            className="align-items-end"
            style={{ justifyContent: "flex-end" }}
          >
            <Button
              size="small"
              onClick={(e) => {
                setShouldOpenDeleteModal(false);
              }}
              startIcon={<ExitToAppIcon />}
              variant="contained"
              disableElevation
            >
              {t("btn.close")} (Esc)
            </Button>
            <Button
              className={deleteProcess ? "button-loading" : ""}
              endIcon={deleteProcess && <LoopIcon />}
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
    </Grid>
  );
};

export default EditImportInventory;
