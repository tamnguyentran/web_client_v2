import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Grid, TextField, Button } from "@material-ui/core";
import DateFnsUtils from "@date-io/date-fns";
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from "@material-ui/pickers";
import moment from "moment";
import Product_Autocomplete from "../../Products/Product/Control/Product.Autocomplete";
import SearchIcon from "@material-ui/icons/Search";
import LoopIcon from "@material-ui/icons/Loop";
import glb_sv from "../../../utils/service/global_service";

import {
  TextFieldCpn,
  TitleFilterCpn,
  SelectCpn,
  DatePickerCpn,
  ButtonCpn,
} from "../../../basicComponents";
import { Product } from "../../../components/Autocomplete";

const TransactionStatementSearch = ({ handleSearch, process = false }) => {
  const { t } = useTranslation();

  const [searchModal, setSearchModal] = useState({
    start_dt: glb_sv.startDay,
    end_dt: glb_sv.endDay,
    product_nm: "",
    product_id: null,
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

  const handleSelectProduct = (obj) => {
    const newSearchModal = { ...searchModal };
    newSearchModal["product_id"] = !!obj ? obj?.o_1 : null;
    newSearchModal["product_nm"] = !!obj ? obj?.o_2 : "";
    setSearchModal(newSearchModal);
  };

  return (
    <>
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
          {/* <TextFieldCpn
            className="mb-1"
            label="Mã hoá đơn"
            onChange={handleChange}
            onKeyPress={(key) => {
              if (key.which === 13) return handleSearch(searchModal);
            }}
            value={searchModal.invoice_no}
            name="invoice_no"
          /> */}
          {/* <Supplier
            value={searchModal.supplier_nm || ""}
            size={"small"}
            label={t("Nhà cung ứng")}
            onSelect={handleSelectSupplier}
            onKeyPress={(key) => {
              if (key.which === 13) return handleSearch(searchModal);
            }}
          /> */}
        </div>
        <div className="mt-2">
          <ButtonCpn.ButtonSearch
            process={process}
            onClick={() => handleSearch(searchModal)}
          />
        </div>
      </div>
      {false && (
        <Grid container spacing={2}>
          <Grid item xs={3}>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <KeyboardDatePicker
                disableToolbar
                margin="dense"
                variant="outlined"
                style={{ width: "100%" }}
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
          <Grid item xs={3}>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
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
            </MuiPickersUtilsProvider>
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
          <Grid item xs={3} className="d-flex align-items-center">
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
      )}
    </>
  );
};

export default TransactionStatementSearch;
