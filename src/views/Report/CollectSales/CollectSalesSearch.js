import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Grid, TextField, Button } from "@material-ui/core";
import DateFnsUtils from "@date-io/date-fns";
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from "@material-ui/pickers";
import moment from "moment";
import Supplier_Autocomplete from "../../Partner/Supplier/Control/Supplier.Autocomplete";
import SearchIcon from "@material-ui/icons/Search";
import LoopIcon from "@material-ui/icons/Loop";
import {
  TextFieldCpn,
  TitleFilterCpn,
  SelectCpn,
  DatePickerCpn,
  ButtonCpn,
} from "../../../basicComponents";
import { Dictionary } from "../../../components/Autocomplete";

const CollectSalesSearch = ({ handleSearch, process = false }) => {
  const { t } = useTranslation();

  const [searchModal, setSearchModal] = useState({
    start_dt: moment().subtract(1, "month").toString(),
    end_dt: moment().toString(),
    customer_nm: "",
    customer_id: null,
    invoice_no: "",
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
    const newSearchModal = { ...searchModal };
    newSearchModal[e.target.name] = e.target.value;
    setSearchModal(newSearchModal);
  };

  const handleSelectCustomer = (obj) => {
    const newSearchModal = { ...searchModal };
    newSearchModal["customer_id"] = !!obj ? obj?.o_1 : null;
    newSearchModal["customer_nm"] = !!obj ? obj?.o_2 : "";
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
          <Dictionary
            directionName="customers"
            value={searchModal.customer_nm || ""}
            size={"small"}
            label={t("menu.customer")}
            onSelect={handleSelectCustomer}
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
        <Grid container spacing={2}>
          <Grid item xs>
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
          <Grid item xs>
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
          <Grid item xs>
            <Supplier_Autocomplete
              value={searchModal.customer_nm || ""}
              style={{ marginTop: 8, marginBottom: 4, width: "100%" }}
              size={"small"}
              label={t("menu.customer")}
              onSelect={handleSelectCustomer}
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
      )}
    </>
  );
};

export default CollectSalesSearch;
