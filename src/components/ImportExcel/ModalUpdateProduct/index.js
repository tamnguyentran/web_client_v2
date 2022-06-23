import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import moment from "moment";
import DateFnsUtils from "@date-io/date-fns";
import {
  Button,
  Dialog,
  CardHeader,
  CardContent,
  Card,
  CardActions,
  Grid,
  TextField,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
  Tooltip,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import Unit_Autocomplete from "../../../views/Config/Unit/Control/Unit.Autocomplete";
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from "@material-ui/pickers";
import ProductGroup_Autocomplete from "../../../views/Products/ProductGroup/Control/ProductGroup.Autocomplete";
import UnitAdd_Autocomplete from "../../../views/Config/Unit/Control/UnitAdd.Autocomplete";
import NumberFormat from "react-number-format";
// dược phẩm 19 thực phẩm chức năng 20
const ModalUpdateProduct = (props) => {
  const {
    shouldOpenModalEdit,
    editModal,
    handleSelectProductGroup,
    step19Ref,
    step18Ref,
    step20Ref,
    step28Ref,
    handleSelectUnit,
    isInfoObj,
    setIsInfoObj,
    handleUpdateRow,
    setShouldOpenModalEdit,
    setEditID,
    setEditModal,
    productDefaulModal,
  } = props;

  const step1Ref = useRef(null);
  const step2Ref = useRef(null);
  const step3Ref = useRef(null);
  const step4Ref = useRef(null);
  const step5Ref = useRef(null);
  const step6Ref = useRef(null);
  const step7Ref = useRef(null);
  const step8Ref = useRef(null);
  const step9Ref = useRef(null);
  const step10Ref = useRef(null);
  const step11Ref = useRef(null);
  const step12Ref = useRef(null);
  const step13Ref = useRef(null);
  const step14Ref = useRef(null);
  const step15Ref = useRef(null);
  const step16Ref = useRef(null);
  const step17Ref = useRef(null);
  const step22Ref = useRef(null);
  const step21Ref = useRef(null);
  const step23Ref = useRef(null);
  const step24Ref = useRef(null);
  const step25Ref = useRef(null);
  const step26Ref = useRef(null);
  const step27Ref = useRef(null);
  const { t } = useTranslation();

  const handleExpDateChange = (date) => {
    const newEditModal = JSON.parse(JSON.stringify(editModal));
    newEditModal["expire_date"] = date ? moment(date).format("MM/DD/YYYY") : "";
    setEditModal(newEditModal);
  };

  const handleSelectUnitRate = (obj) => {
    const newEditModal = JSON.parse(JSON.stringify(editModal));
    newEditModal["unit_other_id"] = !!obj ? obj?.o_1 : null;
    newEditModal["unit_other"] = !!obj ? obj?.o_2 : null;
    if (!obj) {
      newEditModal["convert_rate"] = 0;
    }
    setEditModal({ ...newEditModal });
  };

  const handleValueChange = (name, value) => {
    const newModal = JSON.parse(JSON.stringify(editModal));
    if (name === "imp_vat" || name === "exp_vat") {
      if(!(value < 0 || value > 100)){
        newModal[name] = value;
      }
    } else if (name === "convert_rate") {
      value = Number(
        value
          ?.split("")
          ?.filter((item, index) => item !== ",")
          ?.join("")
      );
      newModal[name] = value < 0 ? 0 : value;
    } else {
      newModal[name] = value;
    }
    setEditModal(newModal);
  };

  const handleChange = (e) => {
    const newModal = { ...editModal };
    newModal[e.target.name] =
      e.target.name === "name" || e.target.code === "name"
        ? e.target.value.toUpperCase()
        : e.target.value;
    setEditModal({ ...newModal });
  };

  const handleChangeShowDropdownInfoProduct = (keyShow,value) => {
    switch (keyShow) {
      case "infoExpanded":
        setIsInfoObj({ ...isInfoObj, isExpanded: value });
        break;
      case "infoInventory":
        setIsInfoObj({ ...isInfoObj, isInventory: value });
        break;
      case "infoPrice":
        setIsInfoObj({ ...isInfoObj, isInfoPrice: value });
        break;
      case "infoAddUnit":
        setIsInfoObj({ ...isInfoObj, isAddUnit: value });
        break;
    }
  };

  return (
    <>
      {/* Modal cập nhật dòng dữ liệu */}
      <Dialog fullWidth={true} maxWidth="md" open={shouldOpenModalEdit}>
        <Card>
          <CardHeader title={t("product.titleEdit")} />
          <CardContent className="cardContent_modal">
            <Grid container spacing={1}>
              <Grid item xs={6} sm={3}>
                <TextField
                  fullWidth={true}
                  required={true}
                  autoComplete="off"
                  margin="dense"
                  label={t("product.name")}
                  onChange={handleChange}
                  value={editModal.name}
                  name="name"
                  variant="outlined"
                  className="uppercaseInput"
                  inputRef={step2Ref}
                  onKeyPress={(event) => {
                    if (event.key === "Enter") {
                      step3Ref.current.focus();
                    }
                  }}
                />
              </Grid>

              <Grid item xs={6} sm={3}>
                <ProductGroup_Autocomplete
                  required={true}
                  productGroupID={editModal.groupID || null}
                  style={{ marginTop: 8, marginBottom: 4 }}
                  size={"small"}
                  label={t("menu.productGroup")}
                  onSelect={handleSelectProductGroup}
                  inputRef={step3Ref}
                  onKeyPress={(event) => {
                    if (event.key === "Enter") {
                      step4Ref.current.focus();
                    }
                  }}
                />
              </Grid>

              <Grid item xs={6} sm={3} className="d-flex align-items-center">
                <UnitAdd_Autocomplete
                  required={true}
                  unitID={editModal.unitID || null}
                  style={{ marginTop: 8, marginBottom: 4 }}
                  size={"small"}
                  label={t("menu.configUnit")}
                  onSelect={handleSelectUnit}
                  inputRef={step4Ref}
                  onKeyPress={(event) => {
                    if (event.key === "Enter") {
                      step5Ref.current.focus();
                    }
                  }}
                />
              </Grid>

              <Grid item xs={6} sm={3}>
                <Tooltip
                  placement="top"
                  title={t("product.tooltip.barcode")}
                  arrow
                >
                  <TextField
                    fullWidth={true}
                    autoComplete="off"
                    margin="dense"
                    label={t("product.barcode")}
                    onChange={handleChange}
                    value={editModal.barcode}
                    name="barcode"
                    variant="outlined"
                    inputRef={step5Ref}
                    onKeyPress={(event) => {
                      if (event.key === "Enter") {
                        step6Ref.current.focus();
                      }
                    }}
                  />
                </Tooltip>
              </Grid>

              <Grid item xs={6} sm={3}>
                <TextField
                  fullWidth={true}
                  margin="dense"
                  autoComplete="off"
                  label={t("product.packing")}
                  onChange={handleChange}
                  value={editModal.packing}
                  name="packing"
                  variant="outlined"
                  inputRef={step6Ref}
                  onKeyPress={(event) => {
                    if (event.key === "Enter") {
                      step7Ref.current.focus();
                    }
                  }}
                />
              </Grid>

              <Grid item xs={6} sm={6}>
                <TextField
                  fullWidth={true}
                  margin="dense"
                  autoComplete="off"
                  label={t("product.contente")}
                  onChange={handleChange}
                  value={editModal.contents}
                  name="contents"
                  variant="outlined"
                  inputRef={step7Ref}
                  onKeyPress={(event) => {
                    if (event.key === "Enter") {
                      handleChangeShowDropdownInfoProduct("infoExpanded", true);
                      setTimeout(() => {
                        step8Ref.current.focus();
                      }, 10);
                    }
                  }}
                />
              </Grid>
            </Grid>

            <Accordion
              className="mt-2"
              expanded={isInfoObj.isExpanded}
              onChange={() => {
                handleChangeShowDropdownInfoProduct("infoExpanded", !isInfoObj.isExpanded);
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1bh-content"
                id="panel1bh-header"
                height="50px"
              >
                <Typography className="">{t("product.infoExpand")}</Typography>
              </AccordionSummary>
              <AccordionDetails className="pt-0">
                <Grid container className="" spacing={1}>
                  <Grid item xs={12} sm={6} md={6}>
                    <TextField
                      fullWidth={true}
                      margin="dense"
                      autoComplete="off"
                      label={t("product.designate")}
                      onChange={handleChange}
                      value={editModal.designate}
                      name="designate"
                      variant="outlined"
                      inputRef={step8Ref}
                      onKeyPress={(event) => {
                        if (event.key === "Enter") {
                          step9Ref.current.focus();
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={6}>
                    <TextField
                      fullWidth={true}
                      margin="dense"
                      autoComplete="off"
                      label={t("product.contraind")}
                      onChange={handleChange}
                      value={editModal.contraind}
                      name="contraind"
                      variant="outlined"
                      inputRef={step9Ref}
                      onKeyPress={(event) => {
                        if (event.key === "Enter") {
                          step10Ref.current.focus();
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={6}>
                    <TextField
                      fullWidth={true}
                      margin="dense"
                      autoComplete="off"
                      label={t("product.dosage")}
                      onChange={handleChange}
                      value={editModal.dosage}
                      name="dosage"
                      variant="outlined"
                      inputRef={step10Ref}
                      onKeyPress={(event) => {
                        if (event.key === "Enter") {
                          step11Ref.current.focus();
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={6}>
                    <TextField
                      fullWidth={true}
                      margin="dense"
                      autoComplete="off"
                      label={t("product.manufact")}
                      onChange={handleChange}
                      value={editModal.manufact}
                      name="manufact"
                      variant="outlined"
                      inputRef={step11Ref}
                      onKeyPress={(event) => {
                        if (event.key === "Enter") {
                          step12Ref.current.focus();
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={6}>
                    <TextField
                      fullWidth={true}
                      margin="dense"
                      autoComplete="off"
                      label={t("product.interact")}
                      onChange={handleChange}
                      value={editModal.interact}
                      name="interact"
                      variant="outlined"
                      inputRef={step12Ref}
                      onKeyPress={(event) => {
                        if (event.key === "Enter") {
                          step13Ref.current.focus();
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={6}>
                    <TextField
                      fullWidth={true}
                      margin="dense"
                      autoComplete="off"
                      label={t("product.storages")}
                      onChange={handleChange}
                      value={editModal.storages}
                      name="storages"
                      variant="outlined"
                      inputRef={step13Ref}
                      onKeyPress={(event) => {
                        if (event.key === "Enter") {
                          step14Ref.current.focus();
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={6}>
                    <TextField
                      fullWidth={true}
                      margin="dense"
                      autoComplete="off"
                      label={t("product.effect")}
                      onChange={handleChange}
                      value={editModal.effect}
                      name="effect"
                      variant="outlined"
                      inputRef={step14Ref}
                      onKeyPress={(event) => {
                        if (event.key === "Enter") {
                          step15Ref.current.focus();
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={6}>
                    <TextField
                      fullWidth={true}
                      margin="dense"
                      autoComplete="off"
                      label={t("product.overdose")}
                      onChange={handleChange}
                      value={editModal.overdose}
                      name="overdose"
                      variant="outlined"
                      inputRef={step15Ref}
                      onKeyPress={(event) => {
                        if (event.key === "Enter") {
                          handleChangeShowDropdownInfoProduct("infoInventory", true);
                          setTimeout(() => {
                            step16Ref.current.focus();
                          }, 500);
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            <Accordion
              className="mt-2"
              expanded={isInfoObj.isInventory}
              onChange={() => {
                handleChangeShowDropdownInfoProduct("infoInventory", !isInfoObj.isInventory);
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1bh-content"
                id="panel1bh-header"
                height="50px"
              >
                <Typography className="">{t("Thông tin tồn kho")}</Typography>
              </AccordionSummary>
              <AccordionDetails className="pt-0">
                <Grid container className="" spacing={1}>
                  <Grid item xs={12} sm={3} md={3}>
                    <NumberFormat
                      className="inputNumber"
                      style={{ width: "100%" }}
                      value={editModal.invenqty || 0}
                      name={"invenqty"}
                      label={t("product.store_current")}
                      customInput={TextField}
                      autoComplete="off"
                      margin="dense"
                      type="text"
                      variant="outlined"
                      thousandSeparator={true}
                      inputRef={step16Ref}
                      onValueChange={(e) => {
                        handleValueChange("invenqty", e.floatValue);
                      }}
                      onFocus={(e) => e.target.select()}
                      onKeyPress={(event) => {
                        if (event.key === "Enter") {
                          step17Ref.current.focus();
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={2} md={2}>
                    <TextField
                      disabled={true}
                      fullWidth={true}
                      margin="dense"
                      autoComplete="off"
                      label={t("min_unit")}
                      value={editModal.unit || ""}
                      name="unit"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={2} md={2}>
                    <NumberFormat
                      className="inputNumber"
                      style={{ width: "100%" }}
                      value={editModal.inven_price}
                      name="inven_price"
                      label={t("product.inven_pricevsv")}
                      customInput={TextField}
                      autoComplete="off"
                      margin="dense"
                      type="text"
                      variant="outlined"
                      thousandSeparator={true}
                      inputRef={step17Ref}
                      onValueChange={(e) => {
                        handleValueChange("inven_price", e.floatValue);
                      }}
                      onFocus={(e) => e.target.select()}
                      onKeyPress={(event) => {
                        if (event.key === "Enter") {
                          step18Ref.current.focus();
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={2} md={2}>
                    <TextField
                      fullWidth={true}
                      margin="dense"
                      required={editModal.invenqty > 0}
                      autoComplete="off"
                      label={t("order.import.lot_no")}
                      onChange={handleChange}
                      value={editModal.lotno || ""}
                      name="lotno"
                      variant="outlined"
                      inputRef={step18Ref}
                      onKeyPress={(event) => {
                        if (event.key === "Enter") {
                          step19Ref.current.focus();
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3} md={3}>
                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                      <KeyboardDatePicker
                        disableToolbar
                        margin="dense"
                        variant="outlined"
                        style={{ width: "100%" }}
                        inputVariant="outlined"
                        format="dd/MM/yyyy"
                        id="exp_dt-picker-inline"
                        label={t("order.import.exp_dt")}
                        value={editModal.expire_date || null}
                        name="expire_date"
                        onChange={handleExpDateChange}
                        KeyboardButtonProps={{
                          "aria-label": "change date",
                        }}
                        inputRef={step19Ref}
                        onKeyPress={(event) => {
                          if (event.key === "Enter") {
                            handleChangeShowDropdownInfoProduct("infoPrice", true);
                            setTimeout(() => {
                              step20Ref.current.focus();
                            }, 500);
                          }
                        }}
                      />
                    </MuiPickersUtilsProvider>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            <Accordion
              className="mt-2"
              expanded={isInfoObj.isInfoPrice}
              onChange={() => {
                handleChangeShowDropdownInfoProduct("infoPrice", !isInfoObj.isInfoPrice);
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1bh-content"
                id="panel1bh-header"
                height="50px"
              >
                <Typography className="">
                  {t("Thêm hạn mức kho và giá bán")}
                </Typography>
              </AccordionSummary>
              <AccordionDetails className="pt-0">
                <Grid container className="" spacing={1}>
                  <Grid item xs={12} sm={3} md={3}>
                    <Tooltip
                      placement="top"
                      title={t("product.tooltip.minmax_notinput")}
                      arrow
                    >
                      <NumberFormat
                        className="inputNumber w-100"
                        value={editModal.inven_min || 0}
                        name="inven_min"
                        label={t("config.store_limit.minQuantity")}
                        customInput={TextField}
                        autoComplete="off"
                        margin="dense"
                        type="text"
                        variant="outlined"
                        thousandSeparator={true}
                        inputRef={step20Ref}
                        onValueChange={(e) => {
                          handleValueChange("inven_min", e.floatValue);
                        }}
                        onFocus={(e) => e.target.select()}
                        onKeyPress={(event) => {
                          if (event.key === "Enter") {
                            step21Ref.current.focus();
                          }
                        }}
                      />
                    </Tooltip>
                  </Grid>
                  <Grid item xs={12} sm={3} md={3}>
                    <Tooltip
                      placement="top"
                      title={t("product.tooltip.minmax_notinput")}
                      arrow
                    >
                      <NumberFormat
                        className="inputNumber w-100"
                        value={editModal.inven_max || 0}
                        helperText={
                          editModal.inven_max > editModal.inven_min
                            ? ""
                            : <div style={{color: 'red'}}>{"phải lớn hơn hạn mức tối thiểu"}</div>
                        }
                        name="inven_max"
                        label={t("config.store_limit.maxQuantity")}
                        customInput={TextField}
                        autoComplete="off"
                        margin="dense"
                        type="text"
                        variant="outlined"
                        thousandSeparator={true}
                        onValueChange={(e) => {
                          handleValueChange("inven_max", e.floatValue);
                        }}
                        onFocus={(e) => e.target.select()}
                        inputRef={step21Ref}
                        onKeyPress={(event) => {
                          if (event.key === "Enter") {
                            step22Ref.current.focus();
                          }
                        }}
                      />
                    </Tooltip>
                  </Grid>
                  <Grid item xs={12} sm={2} md={2}>
                    <TextField
                      disabled={true}
                      fullWidth={true}
                      margin="dense"
                      autoComplete="off"
                      label={t("min_unit")}
                      value={editModal.unit || ""}
                      name="unit"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={2} md={2}>
                    <NumberFormat
                      className="inputNumber w-100"
                      value={editModal.imp_price || 0}
                      name="imp_price"
                      label={t("config.price.importPrice")}
                      customInput={TextField}
                      autoComplete="off"
                      margin="dense"
                      type="text"
                      variant="outlined"
                      thousandSeparator={true}
                      onValueChange={(e) => {
                        handleValueChange("imp_price", e.floatValue);
                      }}
                      inputRef={step22Ref}
                      onFocus={(e) => e.target.select()}
                      onKeyPress={(event) => {
                        if (event.key === "Enter") {
                          step23Ref.current.focus();
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={2} md={2}>
                    <NumberFormat
                      className="inputNumber w-100"
                      value={editModal.imp_vat || 0}
                      name="imp_vat"
                      label={t("config.price.importVAT")}
                      customInput={TextField}
                      autoComplete="off"
                      margin="dense"
                      type="text"
                      variant="outlined"
                      suffix="%"
                      inputRef={step23Ref}
                      onValueChange={(e) => {
                        handleValueChange("imp_vat", e.floatValue);
                      }}
                      onFocus={(e) => e.target.select()}
                      onKeyPress={(event) => {
                        if (event.key === "Enter") {
                          step24Ref.current.focus();
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4} md={4}>
                    <NumberFormat
                      className="inputNumber w-100"
                      value={editModal.exp_price || 0}
                      name="exp_price"
                      label={t("config.price.price")}
                      customInput={TextField}
                      autoComplete="off"
                      margin="dense"
                      type="text"
                      variant="outlined"
                      thousandSeparator={true}
                      inputRef={step24Ref}
                      onValueChange={(e) => {
                        handleValueChange("exp_price", e.floatValue);
                      }}
                      onFocus={(e) => e.target.select()}
                      onKeyPress={(event) => {
                        if (event.key === "Enter") {
                          step25Ref.current.focus();
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4} md={4}>
                    <NumberFormat
                      className="inputNumber w-100"
                      value={editModal.exp_wprice || 0}
                      name="exp_wprice"
                      label={t("config.price.wholePrice")}
                      customInput={TextField}
                      autoComplete="off"
                      margin="dense"
                      type="text"
                      variant="outlined"
                      thousandSeparator={true}
                      onValueChange={(e) => {
                        handleValueChange("exp_wprice", e.floatValue);
                      }}
                      inputRef={step25Ref}
                      onFocus={(e) => e.target.select()}
                      onKeyPress={(event) => {
                        if (event.key === "Enter") {
                          step26Ref.current.focus();
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4} md={4}>
                    <NumberFormat
                      className="inputNumber w-100"
                      value={editModal.exp_vat || 0}
                      name="exp_vat"
                      label={t("config.price.exportVAT")}
                      customInput={TextField}
                      autoComplete="off"
                      margin="dense"
                      type="text"
                      variant="outlined"
                      suffix="%"
                      // thousandSeparator={true}
                      onChange={handleChange}
                      onValueChange={(e) => {
                        handleValueChange("exp_vat", e.floatValue);
                      }}
                      inputRef={step26Ref}
                      onFocus={(e) => e.target.select()}
                      onKeyPress={(event) => {
                        if (event.key === "Enter") {
                          handleChangeShowDropdownInfoProduct("infoAddUnit", true);
                          setTimeout(() => {
                            step27Ref.current.focus();
                          }, 500);
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            <Accordion
              className="mt-2"
              expanded={isInfoObj.isAddUnit}
              onChange={() => {
                handleChangeShowDropdownInfoProduct("infoAddUnit", !isInfoObj.isAddUnit);
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1bh-content"
                id="panel1bh-header"
                height="50px"
              >
                <Typography className="">{t("Thêm đơn vị tính")}</Typography>
              </AccordionSummary>
              <AccordionDetails className="pt-0">
                <Grid container className="" spacing={1}>
                  <Grid item xs={12} sm={4} md={4}>
                    <Unit_Autocomplete
                      unitID={editModal.unit_other_id || null}
                      style={{ marginTop: 8, marginBottom: 4 }}
                      size={"small"}
                      label={t("config.price.unit")}
                      onSelect={handleSelectUnitRate}
                      inputRef={step27Ref}
                      exceptOption={editModal.unitID}
                      onKeyPress={(event) => {
                        if (event.key === "Enter") {
                          step28Ref.current.focus();
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4} md={4}>
                    <NumberFormat
                      disabled={!editModal.unit_other_id}
                      className="inputNumber w-100"
                      required
                      name="convert_rate"
                      helperText={
                        editModal.convert_rate > 1
                          ? ""
                          : <div style={{color: "red"}}>{"Giá trị phải lớn hơn 1"}</div>
                      }
                      value={
                        editModal.convert_rate || 0
                      }
                      label={t("config.unitRate.rate")}
                      customInput={TextField}
                      autoComplete="off"
                      margin="dense"
                      type="text"
                      variant="outlined"
                      thousandSeparator={true}
                      onChange={(e) => {
                        handleValueChange("convert_rate", e.target.value);
                      }}
                      onFocus={(e) => e.target.select()}
                      inputRef={step28Ref}
                      onKeyPress={(event) => {
                        if (event.key === "Enter") {
                          handleUpdateRow();
                        }
                      }}
                      inputProps={{
                        min: 2,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4} md={4}>
                    <TextField
                      disabled={true}
                      fullWidth={true}
                      margin="dense"
                      autoComplete="off"
                      label={t("min_unit")}
                      value={editModal.unit || ""}
                      name="unit_nm"
                      variant="outlined"
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </CardContent>
          <CardActions
            className="align-items-end"
            style={{ justifyContent: "flex-end" }}
          >
            <Button
              size="small"
              onClick={(e) => {
                setShouldOpenModalEdit(false);
                setEditID(null);
                setEditModal({ ...productDefaulModal });
              }}
              startIcon={<ExitToAppIcon />}
              variant="contained"
              disableElevation
            >
              {t("btn.close")} (Esc)
            </Button>
            <Button
              size="small"
              onClick={() => handleUpdateRow()}
              variant="contained"
              disabled={
                !editModal?.name?.trim() ||
                !editModal?.groupID ||
                !editModal?.unitID ||
                ((editModal.groupID === 19 || editModal.groupID === 20) &&
                  editModal.expire_date === "")
                  ? true
                  : false
              }
              className={
                !editModal?.name?.trim() ||
                !editModal?.groupID ||
                !editModal?.unitID ||
                ((editModal.groupID === 19 || editModal.groupID === 20) &&
                  editModal.expire_date === "")
                  ? ""
                  : "bg-success text-white"
              }
            >
              {t("btn.update")} (F3)
            </Button>
          </CardActions>
        </Card>
      </Dialog>
    </>
  );
};

export default ModalUpdateProduct;
