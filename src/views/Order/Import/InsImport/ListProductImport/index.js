import React from 'react'
import IconButton from "@material-ui/core/IconButton";
import SaveIcon from "@material-ui/icons/Save";
import DeleteIcon from "@material-ui/icons/Delete";
import CancelIcon from "@material-ui/icons/Cancel";
import BorderColorIcon from "@material-ui/icons/BorderColor";
import {
    Tooltip,
    Table,
    TableBody,
    TableContainer,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Link as LinkMT,
    Select,
    MenuItem,
  } from "@material-ui/core";

import glb_sv from "../../../../../utils/service/global_service";
import NumberFormat from "react-number-format";
import { useTranslation } from "react-i18next";
const ListProductImport = (props) => {
    const { t } = useTranslation();
    const {
        column = [], 
        handleClickEdit, 
        isIndexRow, 
        setIsIndexRow, 
        updateDataListProduct, 
        onRemove, 
        setProductDeleteIndex, 
        handleChangeType, 
        handleChangeUpdate,
        dataSource = [],
        handleClickSortColum,
        sortColumn,
        showIconSort,
        productInfo,
        step2Ref,
        step3Ref
    } = props

    return (
        <TableContainer className="tableContainer tableOrder">
        <Table stickyHeader>
        <caption
            className={[
              "text-center text-danger border-bottom-0",
              dataSource.length > 0 ? "d-none" : "",
            ].join(" ")}
          >
            {t("lbl.emptyData")}
          </caption>
          <TableHead>
            <TableRow>
              {column.map((col, index) => {
                return (
                  <Tooltip
                    placement="top"
                    disableFocusListener
                    disableTouchListener
                    title={t(col.tootip)}
                  >
                    <TableCell
                      colSpan={col.field === "action" ? 2 : 1}
                      nowrap="true"
                      align={col.align}
                      className={[
                        "p-2 border-0 cursor-pointer",
                        col.show ? "d-table-cell" : "d-none",
                      ].join(" ")}
                      key={col.field}
                      onClick={() => {
                        handleClickSortColum(col, index);
                      }}
                    >
                      {t(col.title)}{" "}
                      {sortColumn?.columIndex === index && showIconSort()}
                    </TableCell>
                  </Tooltip>
                );
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {dataSource.map((item, index) => {
              return (
                <TableRow
                  onDoubleClick={() => {
                    handleClickEdit(item, index);
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
                        case "action":
                          return (
                            <>
                              <TableCell align="center" nowrap="true">
                                {isIndexRow === index ? (
                                  <Tooltip
                                    placement="top"
                                    title={t("save")}
                                  >
                                    <IconButton
                                      size="small"
                                      onClick={() => {
                                        updateDataListProduct(item);
                                      }}
                                    >
                                      <SaveIcon
                                        style={{ color: "#066190" }}
                                        fontSize="midlle"
                                      />
                                    </IconButton>
                                  </Tooltip>
                                ) : (
                                  <Tooltip
                                    placement="top"
                                    title={t("delete")}
                                  >
                                    <IconButton
                                      size="small"
                                      onClick={() => {
                                        onRemove(item);
                                        setProductDeleteIndex(index + 1);
                                      }}
                                    >
                                      <DeleteIcon
                                        style={{ color: "red" }}
                                        fontSize="middle"
                                      />
                                    </IconButton>
                                  </Tooltip>
                                )}
                              </TableCell>

                              <TableCell align="center" nowrap="true">
                                {isIndexRow === index ? (
                                  <Tooltip
                                    placement="top"
                                    title={t("cancel")}
                                  >
                                    <IconButton
                                      size="small"
                                      onClick={() => {
                                        setIsIndexRow(null);
                                      }}
                                    >
                                      <CancelIcon
                                        style={{ color: "#732424" }}
                                        fontSize="midlle"
                                      />
                                    </IconButton>
                                  </Tooltip>
                                ) : (
                                  <>
                                    <Tooltip
                                      placement="top"
                                      title={t("update")}
                                    >
                                      <IconButton
                                        size="small"
                                        onClick={() => {
                                          handleClickEdit(item, index);
                                        }}
                                      >
                                        <BorderColorIcon fontSize="midlle" />
                                      </IconButton>
                                    </Tooltip>
                                  </>
                                )}
                              </TableCell>
                            </>
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
                        case "o_4":
                          return (
                            <TableCell align="center" nowrap="true">
                              {isIndexRow === index ? (
                                <Select
                                  id="outlined-margin-dense"
                                  margin="dense"
                                  fullWidth={true}
                                  labelId="export_type"
                                  name="expType"
                                  value={productInfo.expType}
                                  onChange={(event) => {
                                    handleChangeType(event, item);
                                  }}
                                  variant="outlined"
                                >
                                  <MenuItem value="1">
                                    {t("order.export.export_type_buy")}
                                  </MenuItem>
                                  <MenuItem value="2">
                                    {t(
                                      "order.export.export_type_selloff"
                                    )}
                                  </MenuItem>
                                </Select>
                              ) : (
                                item.o_4
                              )}
                            </TableCell>
                          );
                        case "o_10":
                          return (
                            <TableCell align="center" nowrap="true">
                              {isIndexRow === index ? (
                                <NumberFormat
                                  size={"small"}
                                  className="inputNumber"
                                  required
                                  type="teft"
                                  customInput={TextField}
                                  autoComplete="off"
                                  autoFocus={true}
                                  margin="dense"
                                  variant="outlined"
                                  thousandSeparator={true}
                                  // onFocus={handleFocus}
                                  onKeyPress={(event) => {
                                    if (event.key === "Tab") {
                                      step2Ref.current.focus();
                                    }
                                  }}
                                  onValueChange={(value) => {
                                    handleChangeUpdate(
                                      "expQty",
                                      value.floatValue
                                    );
                                  }}
                                  value={productInfo.expQty}
                                />
                              ) : (
                                glb_sv.formatValue(item.o_10, col["type"])
                              )}
                            </TableCell>
                          );

                        case "o_13":
                          return (
                            <TableCell align="center" nowrap="true">
                              {isIndexRow === index ? (
                                <NumberFormat
                                  inputRef={step2Ref}
                                  className="inputNumber"
                                  required
                                  customInput={TextField}
                                  autoComplete="off"
                                  margin="dense"
                                  type="text"
                                  variant="outlined"
                                  value={productInfo.expPrice}
                                  thousandSeparator={true}
                                  disabled={
                                    productInfo.expType === "1"
                                      ? false
                                      : true
                                  }
                                  onValueChange={(value) => {
                                    handleChangeUpdate(
                                      "expPrice",
                                      value.floatValue
                                    );
                                  }}
                                  onKeyPress={(event) => {
                                    if (event.key === "Tab") {
                                      step3Ref.current.focus();
                                    }
                                  }}
                                />
                              ) : (
                                glb_sv.formatValue(item.o_13, col["type"])
                              )}
                            </TableCell>
                          );

                        case "o_14":
                          return (
                            <TableCell align="center" nowrap="true">
                              {isIndexRow === index ? (
                                <NumberFormat
                                  inputRef={step3Ref}
                                  className="inputNumber"
                                  required
                                  customInput={TextField}
                                  autoComplete="off"
                                  margin="dense"
                                  type="text"
                                  variant="outlined"
                                  value={productInfo.expDisCount}
                                  disabled={
                                    productInfo.expType === "1"
                                      ? false
                                      : true
                                  }
                                  onValueChange={(value) => {
                                    handleChangeUpdate(
                                      "expDisCount",
                                      value.floatValue
                                    );
                                  }}
                                  onKeyPress={(event) => {
                                    if (event.key === "Tab") {
                                      // step4Ref.current.focus();
                                    }
                                  }}
                                />
                              ) : (
                                item.o_14
                              )}
                            </TableCell>
                          );
                        case "o_15":
                          return (
                            <TableCell
                              align="center"
                              nowrap="true"
                              style={{ minWidth: "100px" }}
                            >
                              {isIndexRow === index ? (
                                <NumberFormat
                                  // inputRef={step4Ref}
                                  className="inputNumber"
                                  required
                                  customInput={TextField}
                                  autoComplete="off"
                                  margin="dense"
                                  type="text"
                                  value={productInfo.expVAT}
                                  disabled={
                                    productInfo.expType === "1"
                                      ? false
                                      : true
                                  }
                                  variant="outlined"
                                  onValueChange={(value) => {
                                    handleChangeUpdate(
                                      "expVAT",
                                      value.floatValue
                                    );
                                  }}
                                />
                              ) : (
                                item.o_15
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
    )
}

export default ListProductImport