import React, { useState } from "react";
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
import Dictionary_Autocomplete from "../../../components/Dictionary_Autocomplete/index";
import SearchIcon from "@material-ui/icons/Search";
import LoopIcon from "@material-ui/icons/Loop";
import { Dictionary } from "../../../components/Autocomplete";
import {
  TextFieldCpn,
  TitleFilterCpn,
  SelectCpn,
  DatePickerCpn,
  ButtonCpn,
} from "../../../basicComponents";

const InventorySearch = ({ handleSearch, process = false }) => {
  const { t } = useTranslation();

  const [searchModal, setSearchModal] = useState({
    group_id: null,
    group_nm: "",
    lot_no: "",
    invent_yn: "Y",
  });
  const [isExpanded, setIsExpanded] = useState(true);

  const handleChangeExpand = () => {
    setIsExpanded((e) => !e);
  };

  const handleChange = (e) => {
    const newSearchModal = { ...searchModal };
    newSearchModal[e.target.name] = e.target.value;
    setSearchModal(newSearchModal);
  };

  const handleSelectGroup = (obj) => {
    const newSearchModal = { ...searchModal };
    newSearchModal["group_id"] = !!obj ? obj?.o_1 : null;
    newSearchModal["group_nm"] = !!obj ? obj?.o_2 : "";
    setSearchModal(newSearchModal);
  };

  return (
    <>
      <div className="p-2">
        <div className="mb-4">
          <TitleFilterCpn className="mb-2" label="Lọc theo thông tin" />
          <Dictionary
            directionName="groups"
            value={searchModal.group_nm || ""}
            size={"small"}
            label={t("menu.productGroup")}
            onSelect={handleSelectGroup}
            onKeyPress={(key) => {
              if (key.which === 13) return handleSearch(searchModal);
            }}
          />
          <SelectCpn
            value={searchModal.invent_yn || "Y"}
            onChange={handleChange}
            onKeyPress={(key) => {
              if (key.which === 13) return handleSearch(searchModal);
            }}
            label={t("report.import_type")}
            name="invent_yn"
          >
            <MenuItem value="Y">{t("report.all")}</MenuItem>
            <MenuItem value="N">{t("report.inven")}</MenuItem>
          </SelectCpn>
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
            <Dictionary_Autocomplete
              directionName="groups"
              value={searchModal.group_nm || ""}
              style={{ marginTop: 8, marginBottom: 4, width: "100%" }}
              size={"small"}
              label={t("menu.productGroup")}
              onSelect={handleSelectGroup}
              onKeyPress={(key) => {
                if (key.which === 13) return handleSearch(searchModal);
              }}
            />
          </Grid>
          <Grid item xs={3}>
            <FormControl margin="dense" variant="outlined" className="w-100">
              <InputLabel id="status">{t("report.import_type")}</InputLabel>
              <Select
                labelId="status"
                id="status-select"
                value={searchModal.invent_yn || "Y"}
                onChange={handleChange}
                onKeyPress={(key) => {
                  if (key.which === 13) return handleSearch(searchModal);
                }}
                label={t("report.import_type")}
                name="invent_yn"
              >
                <MenuItem value="Y">{t("report.all")}</MenuItem>
                <MenuItem value="N">{t("report.inven")}</MenuItem>
              </Select>
            </FormControl>
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

export default InventorySearch;
