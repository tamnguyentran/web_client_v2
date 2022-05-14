import React from 'react'
import {
    Grid,
    Tooltip,
    Button,
    Divider,
    TextField,
    Card,
    CardHeader,
    CardContent,
    Link as LinkMT,
  } from "@material-ui/core";

import AddShoppingCartIcon from "@material-ui/icons/AddShoppingCart";
import HistoryIcon from "@material-ui/icons/History";
import SupplierAdd_Autocomplete from "../../../../Partner/Supplier/Control/SupplierAdd.Autocomplete";
import glb_sv from "../../../../../utils/service/global_service";
import NumberFormat from "react-number-format";
import { useTranslation } from "react-i18next";
import {
    MuiPickersUtilsProvider,
    KeyboardDatePicker,
  } from "@material-ui/pickers";
  import DateFnsUtils from "@date-io/date-fns";
const InfoInvoice = (props) => {
console.log("vsvsvsvs")
    const {
        setOpenModalShowBill,
        setImport,
        invoiceImportModal,
        setDataSource,
        setInvoiceFlag,
        setSupplierSelect,
        setIsIndexRow,
        invoiceFlag,
        handleChange,
        supplierSelect,
        handleSelectSupplier,
        step1Ref,
        step2Ref,
        step3Ref,
        Import = [],
        handleCreateSupplier,
        handleDateChange,
        handleUpdateInvoice,
        paymentInfo = [],
        handleAmountChange,
        checkValidate,
        handlePrint
     } = props
    const { t } = useTranslation();
    return (
        <Card className="h-100">
        <CardHeader
          title={
            <div className="flex justify-content-between aligh-item-center">
              <div>{t("order.import.invoice_info")}</div>
              <div className="cursor-pointer flex">
                <div className="mr-1">
                  <Tooltip
                    disableFocusListener
                    title={t("order.exportRepay.intraday_trans_his")}
                  >
                    <HistoryIcon
                      onClick={() => {
                        setOpenModalShowBill((pre) => !pre);
                      }}
                    />
                  </Tooltip>
                </div>
                <div className="mr-1">
                  <Tooltip
                    disableFocusListener
                    title={t("order.exportRepay.new_invoice")}
                  >
                    <AddShoppingCartIcon
                      onClick={() => {
                        setImport({ ...invoiceImportModal });
                        setDataSource([]);
                        setInvoiceFlag(false);
                        setSupplierSelect("");
                        setIsIndexRow(null);
                      }}
                    />
                  </Tooltip>
                </div>
              </div>
            </div>
          }
        />
        <CardContent>
          <Grid container spacing={1}>
            <Tooltip placement="top" title={t("auto_invoice")} arrow>
              <TextField
                fullWidth={true}
                disabled={invoiceFlag}
                margin="dense"
                autoComplete="off"
                label={t("auto_invoice")}
                className="uppercaseInput"
                onChange={handleChange}
                value={Import.invoice_no || ""}
                name="invoice_no"
                variant="outlined"
              />
            </Tooltip>
            <div className="d-flex align-items-center w-100">
              <SupplierAdd_Autocomplete
                autoFocus={true}
                value={supplierSelect || ""}
                size={"small"}
                label={t("menu.supplier")}
                onSelect={handleSelectSupplier}
                onCreate={handleCreateSupplier}
                inputRef={step1Ref}
                onKeyPress={(event) => {
                  if (event.key === "Enter") {
                    step2Ref.current.focus();
                  }
                }}
              />
            </div>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <KeyboardDatePicker
                disabled={true}
                disableToolbar
                margin="dense"
                variant="outlined"
                style={{ width: "100%" }}
                inputVariant="outlined"
                format="dd/MM/yyyy"
                id="order_dt-picker-inline"
                label={t("order.import.order_dt")}
                value={Import.order_dt}
                onChange={handleDateChange}
                KeyboardButtonProps={{
                  "aria-label": "change date",
                }}
                inputRef={step2Ref}
                onKeyPress={(event) => {
                  if (event.key === "Enter") {
                    step3Ref.current.focus();
                  }
                }}
              />
            </MuiPickersUtilsProvider>
            <TextField
              fullWidth={true}
              margin="dense"
              multiline
              autoComplete="off"
              rows={1}
              rowsMax={5}
              label={t("order.import.note")}
              onChange={handleChange}
              value={Import.note || ""}
              name="note"
              variant="outlined"
              inputRef={step3Ref}
              onKeyPress={(event) => {
                if (event.key === "Enter") {
                  handleUpdateInvoice();
                }
              }}
            />
            <NumberFormat
              className="inputNumber"
              style={{ width: "100%" }}
              value={Import.invoice_val || 0}
              label={t("order.import.invoice_val")}
              customInput={TextField}
              autoComplete="off"
              margin="dense"
              type="text"
              variant="outlined"
              thousandSeparator={true}
              disabled={true}
            />
            <NumberFormat
              className="inputNumber"
              style={{ width: "100%" }}
              value={Import.invoice_discount || 0}
              label={t("order.import.invoice_discount")}
              customInput={TextField}
              autoComplete="off"
              margin="dense"
              type="text"
              variant="outlined"
              thousandSeparator={true}
              disabled={true}
            />
            <NumberFormat
              className="inputNumber"
              style={{ width: "100%" }}
              value={Import.invoice_vat || 0}
              label={t("order.import.invoice_vat")}
              customInput={TextField}
              autoComplete="off"
              margin="dense"
              type="text"
              variant="outlined"
              thousandSeparator={true}
              disabled={true}
            />
            <Divider orientation="horizontal" />
            <NumberFormat
              className="inputNumber"
              style={{ width: "100%" }}
              value={paymentInfo.invoice_needpay}
              label={t("order.import.invoice_needpay")}
              customInput={TextField}
              autoComplete="off"
              margin="dense"
              type="text"
              variant="outlined"
              thousandSeparator={true}
              disabled={true}
            />
            <NumberFormat
              className="inputNumber"
              style={{ width: "100%" }}
              required
              value={Import.payment_amount}
              label={t("settlement.payment_amount")}
              onValueChange={handleAmountChange}
              name="payment_amount"
              customInput={TextField}
              autoComplete="off"
              margin="dense"
              type="text"
              variant="outlined"
              thousandSeparator={true}
            />
            <Divider orientation="horizontal" flexItem />
            <NumberFormat
              className="inputNumber"
              style={{ width: "100%" }}
              value={
                Import.payment_amount - paymentInfo.invoice_needpay > 0
                  ? Import.payment_amount - paymentInfo.invoice_needpay
                  : 0
              }
              label={t("settlement.excess_cash")}
              customInput={TextField}
              autoComplete="off"
              margin="dense"
              type="text"
              variant="outlined"
              thousandSeparator={true}
              disabled={true}
            />
          </Grid>
          <Grid container spacing={1} className="mt-2">
            <Button
              style={{
                width: "calc(60% - 0.25rem)",
                marginRight: "0.5rem",
              }}
              size="small"
              onClick={() => {
                handleUpdateInvoice();
              }}
              variant="contained"
              disabled={checkValidate}
              className={
                checkValidate === false ? "bg-success text-white" : ""
              }
            >
              {t("btn.payment2")}
            </Button>
            <Button
              onClick={handlePrint}
              disabled={!invoiceFlag}
              className={invoiceFlag ? "bg-print text-white" : ""}
              id="buttonPrint"
              size="smail"
              variant="contained"
              style={{ width: "calc(40% - 0.25rem)" }}
            >
              {t("print")}
            </Button>
          </Grid>
        </CardContent>
      </Card>
    )
}

export default InfoInvoice