import React, { useState, Fragment } from "react";
import { useTranslation } from "react-i18next";
import {
  Grid,
  TextField,
  Button,
  InputLabel,
  MenuItem,
  FormControl,
  Select,
} from "@material-ui/core";
import DateFnsUtils from "@date-io/date-fns";
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from "@material-ui/pickers";
import { Unit, Product } from "../../../components/Autocomplete";
import moment from "moment";
import Supplier_Autocomplete from "../../Partner/Supplier/Control/Supplier.Autocomplete";
import Product_Autocomplete from "../../Products/Product/Control/Product.Autocomplete";
import SearchIcon from "@material-ui/icons/Search";
import LoopIcon from "@material-ui/icons/Loop";

import { Supplier } from "../../../components/Autocomplete";
import {
  TextFieldCpn,
  TitleFilterCpn,
  SelectCpn,
  DatePickerCpn,
  ButtonCpn,
} from "../../../basicComponents";

const ImportSearch = ({ handleSearch, process = false }) => {
  const { t } = useTranslation();

  const [searchModal, setSearchModal] = useState({
    start_dt: moment().subtract(1, "month").toString(),
    end_dt: moment().toString(),
    supplier_nm: "",
    supplier_id: null,
    invoice_no: "",
    invoice_status: "1",
    product_id: null,
    product_nm: "",
  });
  const [isExpanded, setIsExpanded] = useState(true);

  const handleChangeExpand = () => {
    setIsExpanded((e) => !e);
  };

  const handleStartDateChange = (date) => {
    const newSearchModal = { ...searchModal };
    newSearchModal["start_dt"] = date;
    setSearchModal(newSearchModal);
  };

  const handleEndDateChange = (date) => {
    const newSearchModal = { ...searchModal };
    newSearchModal["end_dt"] = date;
    setSearchModal(newSearchModal);
  };

  const handleChange = (e) => {
    console.log(e.target.name, e.target.value);
    const newSearchModal = { ...searchModal };
    newSearchModal[e.target.name] = e.target.value;
    setSearchModal(newSearchModal);
  };

  const handleSelectSupplier = (obj) => {
    const newSearchModal = { ...searchModal };
    newSearchModal["supplier_id"] = !!obj ? obj?.o_1 : null;
    newSearchModal["supplier_nm"] = !!obj ? obj?.o_2 : "";
    setSearchModal(newSearchModal);
  };

  const handleSelectProduct = (obj) => {
    const newSearchModal = { ...searchModal };
    newSearchModal["product_id"] = !!obj ? obj?.o_1 : null;
    newSearchModal["product_nm"] = !!obj ? obj?.o_2 : "";
    setSearchModal(newSearchModal);
  };

  return (
    <>
      {" "}
      <div className="p-2">
        <div className="mb-4">
          <TitleFilterCpn className="mb-2" label="Lọc theo thời gian" />
          <DatePickerCpn
            label="Ngày bắt đầu"
            className="mb-1"
            value={searchModal.start_dt}
            onChange={handleStartDateChange}
            onKeyPress={(key) => {
              if (key.which === 13) return handleSearch(searchModal);
            }}
          />
          <DatePickerCpn
            label="Ngày kết thúc"
            value={searchModal.end_dt}
            onChange={handleEndDateChange}
            onKeyPress={(key) => {
              if (key.which === 13) return handleSearch(searchModal);
            }}
          />
        </div>
        <div className="mb-4">
          <TitleFilterCpn className="mb-2" label="Lọc theo thông tin" />
          <TextFieldCpn
            className="mb-1"
            label="Mã hoá đơn"
            onChange={handleChange}
            onKeyPress={(key) => {
              if (key.which === 13) return handleSearch(searchModal);
            }}
            value={searchModal.invoice_no}
            name="invoice_no"
          />
          <Supplier
            value={searchModal.supplier_nm || ""}
            size={"small"}
            label={t("Nhà cung ứng")}
            onSelect={handleSelectSupplier}
            onKeyPress={(key) => {
              if (key.which === 13) return handleSearch(searchModal);
            }}
          />
          <SelectCpn
            label={t("Trạng thái hợp đồng")}
            value={searchModal.invoice_status || "1"}
            onChange={handleChange}
            onKeyPress={(key) => {
              if (key.which === 13) return handleSearch(searchModal);
            }}
            name="invoice_status"
          >
            <MenuItem value="1">{t("normal")}</MenuItem>
            <MenuItem value="2">{t("cancelled")}</MenuItem>
          </SelectCpn>
          <Product
            className="mt-1"
            value={searchModal.product_nm || ""}
            size={"small"}
            label={t("menu.product")}
            onSelect={handleSelectProduct}
            onKeyPress={(key) => {
              if (key.which === 13) return handleSearch(searchModal);
            }}
          />
        </div>
        <div className="mt-2">
          <ButtonCpn.ButtonSearch
            process={process}
            onClick={() => handleSearch(searchModal)}
          />
        </div>
      </div>
      {false && (
        <>
          <Grid container spacing={2}>
            <Grid item xs>
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                {/* <div className="text-label-input">Nhà cung ứng</div> */}
                <KeyboardDatePicker
                  style={{ marginTop: "0px", height: "50px" }}
                  className="date-picker-cpn"
                  disableToolbar
                  margin="dense"
                  variant="outlined"
                  inputVariant="outlined"
                  format="dd/MM/yyyy"
                  id="order_dt-picker-inline"
                  label={t("order.export.start_date")}
                  value={searchModal.start_dt}
                  onChange={handleStartDateChange}
                  onKeyPress={(key) => {
                    if (key.which === 13) return handleSearch(searchModal);
                  }}
                  KeyboardButtonProps={{
                    "aria-label": "change date",
                  }}
                />
              </MuiPickersUtilsProvider>
            </Grid>
            <Grid item xs>
              <Supplier
                value={searchModal.supplier_nm || ""}
                style={{ marginTop: 8, marginBottom: 4, width: "100%" }}
                size={"small"}
                label={t("menu.supplier")}
                onSelect={handleSelectSupplier}
                onKeyPress={(key) => {
                  if (key.which === 13) return handleSearch(searchModal);
                }}
              />
              {/* <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <KeyboardDatePicker
                  disableToolbar
                  margin="dense"
                  variant="outlined"
                  style={{ width: "100%" }}
                  inputVariant="outlined"
                  format="dd/MM/yyyy"
                  id="order_dt-picker-inline"
                  label={t("order.export.end_date")}
                  value={searchModal.end_dt}
                  onChange={handleEndDateChange}
                  onKeyPress={(key) => {
                    if (key.which === 13) return handleSearch(searchModal);
                  }}
                  KeyboardButtonProps={{
                    "aria-label": "change date",
                  }}
                />
              </MuiPickersUtilsProvider> */}
            </Grid>
            <Grid item xs>
              <Supplier
                value={searchModal.supplier_nm || ""}
                style={{ marginTop: 8, marginBottom: 4, width: "100%" }}
                size={"small"}
                label={t("menu.supplier")}
                onSelect={handleSelectSupplier}
                onKeyPress={(key) => {
                  if (key.which === 13) return handleSearch(searchModal);
                }}
              />
            </Grid>
            <Grid item xs>
              <TextField
                fullWidth={true}
                margin="dense"
                autoComplete="off"
                label={t("invoice_no")}
                onChange={handleChange}
                onKeyPress={(key) => {
                  if (key.which === 13) return handleSearch(searchModal);
                }}
                value={searchModal.invoice_no}
                name="invoice_no"
                variant="outlined"
              />
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={3}>
              <FormControl margin="dense" variant="outlined" className="w-100">
                <InputLabel id="status">{t("invoice_status")}</InputLabel>
                <Select
                  labelId="status"
                  id="status-select"
                  value={searchModal.invoice_status || "1"}
                  onChange={handleChange}
                  onKeyPress={(key) => {
                    if (key.which === 13) return handleSearch(searchModal);
                  }}
                  label={t("invoice_status")}
                  name="invoice_status"
                >
                  {/* <MenuItem value="%">{t('all')}</MenuItem> */}
                  <MenuItem value="1">{t("normal")}</MenuItem>
                  <MenuItem value="2">{t("cancelled")}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={3}>
              <Product_Autocomplete
                value={searchModal.product_nm || ""}
                style={{ marginTop: 8, marginBottom: 4, width: "100%" }}
                size={"small"}
                label={t("menu.product")}
                onSelect={handleSelectProduct}
                onKeyPress={(key) => {
                  if (key.which === 13) return handleSearch(searchModal);
                }}
              />
            </Grid>
            <Grid item className="d-flex align-items-center">
              <Button
                className={process ? "button-loading" : ""}
                endIcon={process ? <LoopIcon /> : <SearchIcon />}
                onClick={() => handleSearch(searchModal)}
                variant="contained"
              >
                {t("search_btn")}
              </Button>
            </Grid>
          </Grid>
        </>
      )}
    </>
  );
};

export default ImportSearch;
