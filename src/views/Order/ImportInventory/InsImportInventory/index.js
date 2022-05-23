import React, { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import moment from "moment";
import NumberFormat from "react-number-format";
import {
  Grid,
  Table,
  TableBody,
  TableContainer,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Button,
  Dialog,
} from "@material-ui/core";
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
  tableListAddColumn,
  invoiceImportInventoryModal,
} from "../Modal/ImportInventory.modal";

import AddProductClone from "../AddProductClone";
import EditProductRows from "../EditImportInventory/EditProductRows";
import { useReactToPrint } from "react-to-print";
import Import_Inventory_Bill from "../../../../components/Bill/Import_Inventory_Bill";
import ExportExcel from "../../../../components/ExportExcel";

const serviceInfo = {
  CREATE_INVOICE: {
    functionName: "insert",
    reqFunct: reqFunction.IMPORT_INVENTORY_LIST,
    biz: "import",
    object: "imp_inventory",
  },
  GET_INVOICE_BY_ID: {
    functionName: "get_by_id",
    reqFunct: reqFunction.IMPORT_BY_ID,
    biz: "import",
    object: "imp_inventory",
  },
  GET_ALL_PRODUCT_BY_INVOICE_ID: {
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
  UPDATE_PRODUCT_TO_INVOICE: {
    functionName: "update",
    reqFunct: reqFunction.PRODUCT_IMPORT_INVOICE_UPDATE,
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

const ProductImportInventory = ({}) => {
  const { t } = useTranslation();
  const [dataSource, setDataSource] = useState([]);
  const [productEditID, setProductEditID] = useState(-1);
  const [column, setColumn] = useState([...tableListAddColumn]);
  const [importInventory, setImportInventory] = useState({
    ...invoiceImportInventoryModal,
  });
  const [productDeleteIndex, setProductDeleteIndex] = useState(null);
  const [productDeleteModal, setProductDeleteModal] = useState({});
  const [shouldOpenDeleteModal, setShouldOpenDeleteModal] = useState(false);
  const [invoiceFlag, setInvoiceFlag] = useState(false);
  const [deleteProcess, setDeleteProcess] = useState(false);
  const [resetFormAddFlag, setResetFormAddFlag] = useState(false);

  const componentPrint = useRef(null);
  const dataWaitAdd = useRef([]);
  const newInvoiceId = useRef(-1);
  const dataSourceRef = useRef([]);

  // useHotkeys('f6', () => handleCreateInvoice(), { enableOnTags: ['INPUT', 'SELECT', 'TEXTAREA'] })

  //-- xử lý khi timeout -> ko nhận được phản hồi từ server
  const handleTimeOut = (e) => {
    SnackBarService.alert(t(`message.${e.type}`), true, 4, 3000);
  };

  const handleAddProduct = (productObject) => {
    if (!invoiceFlag) {
      dataWaitAdd.current.push(productObject);
      sendRequest(
        serviceInfo.CREATE_INVOICE,
        [],
        handleResultCreateInvoice,
        true,
        handleTimeOut
      );
      return;
    } else {
      // đã có invoice => bắn lên server
      const inputParam = [
        newInvoiceId.current,
        productObject.prod_id,
        productObject.lot_no,
        productObject.qty,
        productObject.unit_id,
        moment(productObject.made_dt).format("YYYYMMDD"),
        moment(productObject.exp_dt).format("YYYYMMDD"),
        productObject.price,
      ];
      sendRequest(
        serviceInfo.ADD_PRODUCT_TO_INVOICE,
        inputParam,
        handleResultAddProductToInvoice,
        true,
        handleTimeOut
      );
    }
  };

  const handleResultCreateInvoice = (reqInfoMap, message) => {
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
      let newData = message["PROC_DATA"];
      if (!!newData.rows[0].o_1) {
        newInvoiceId.current = newData.rows[0].o_1;
        sendRequest(
          serviceInfo.GET_INVOICE_BY_ID,
          [newInvoiceId.current],
          handleResultGetInvoiceByID,
          true,
          handleTimeOut
        );
        for (let i = 0; i < dataWaitAdd.current.length; i++) {
          const item = dataWaitAdd.current[i];
          const inputParam = [
            newData.rows[0].o_1,
            item.prod_id,
            item.lot_no,
            item.qty,
            item.unit_id,
            moment(item.made_dt).format("YYYYMMDD"),
            item.exp_dt
              ? moment(item.exp_dt).format("YYYYMMDD")
              : moment().format("YYYYMMDD"),
            item.price,
          ];
          sendRequest(
            serviceInfo.ADD_PRODUCT_TO_INVOICE,
            inputParam,
            handleResultAddProductToInvoice,
            true,
            handleTimeOut
          );
        }
      }
    }
  };

  const handleResultGetInvoiceByID = (reqInfoMap, message) => {
    if (message["PROC_STATUS"] !== 1) {
      // xử lý thất bại
      const cltSeqResult = message["REQUEST_SEQ"];
      glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap);
      control_sv.clearReqInfoMapRequest(cltSeqResult);
    } else if (message["PROC_DATA"]) {
      // xử lý thành công
      let newData = message["PROC_DATA"];
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

  const handleResultAddProductToInvoice = (reqInfoMap, message) => {
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
      dataWaitAdd.current = [];
      setResetFormAddFlag(true);
      setTimeout(() => {
        setResetFormAddFlag(false);
      }, 1000);
      sendRequest(
        serviceInfo.GET_ALL_PRODUCT_BY_INVOICE_ID,
        [newInvoiceId.current],
        handleGetAllProductByInvoiceID,
        true,
        handleTimeOut
      );
      sendRequest(
        serviceInfo.GET_INVOICE_BY_ID,
        [newInvoiceId.current],
        handleResultGetInvoiceByID,
        true,
        handleTimeOut
      );
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

  const handleRefresh = () => {
    sendRequest(
      serviceInfo.GET_ALL_PRODUCT_BY_INVOICE_ID,
      [newInvoiceId.current],
      handleGetAllProductByInvoiceID,
      true,
      handleTimeOut
    );
    sendRequest(
      serviceInfo.GET_INVOICE_BY_ID,
      [newInvoiceId.current],
      handleResultGetInvoiceByID,
      true,
      handleTimeOut
    );
  };

  const onRemove = (item) => {
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
    }
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
      item["invoice_no"] = importInventory.invoice_no;
      item["invoice_val"] = importInventory.total_val;
      item["note"] = importInventory.note;
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
        invoiceID={newInvoiceId.current}
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
            title={t("order.importInventory.productImportList")}
            action={
              <ExportExcel
                filename={`import_inventory_${importInventory.invoice_no}`}
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
                          setProductEditID(item.o_1);
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
                                        setProductEditID(item.o_1);
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
                                      ? t(
                                          "order.importInventory.import_type_buy"
                                        )
                                      : t(
                                          "order.importInventory.import_type_selloff"
                                        )}
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
                autoComplete="off"
                label={t("order.import.invoice_no")}
                disabled={true}
                value={importInventory.invoice_no || ""}
                name="invoice_no"
                variant="outlined"
              />
              <NumberFormat
                className="inputNumber"
                style={{ width: "100%" }}
                required
                value={importInventory.total_val || 0}
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
                value={importInventory.note || ""}
                name="note"
                variant="outlined"
              />
            </Grid>
            <Grid container spacing={1} className="mt-2">
              <Button
                fullWidth={true}
                onClick={handlePrint}
                className={invoiceFlag ? "bg-print text-white" : ""}
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
          headerModal={importInventory}
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

export default ProductImportInventory;
