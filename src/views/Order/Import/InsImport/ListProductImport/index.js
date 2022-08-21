import React from "react";
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
import { ReactComponent as IC_ADD } from "../../../../../asset/images/add.svg";
import { ReactComponent as IC_REDUCED } from "../../../../../asset/images/reduced.svg";

import glb_sv from "../../../../../utils/service/global_service";
import NumberFormat from "react-number-format";
import { useTranslation } from "react-i18next";
import {
  IconButtonCpn, 
} from "../../../../../basicComponents";
const ListProductImport = (props) => {
  const { t } = useTranslation();
  const {
    column = [],
    // handleClickEdit,
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
    setProductInfo,
    step2Ref,
    step3Ref,
  } = props;

  const handleChangeQtyProductInvoice = (type, item, index, valueQty) => {
    console.log(type, item, index, valueQty);
    if (type === "change") {
      setProductInfo((pre) => {
        pre[index] = { ...pre[index], expQty: valueQty };
        return [...pre];
      });
      return updateDataListProduct(valueQty, item.o_13, item);
    }
    if (type === "increase") {
      setProductInfo((pre) => {
        pre[index] = { ...pre[index], expQty: pre[index].expQty + 1 };
        return [...pre];
      });
      return updateDataListProduct(
        productInfo[index].expQty + 1,
        item.o_13,
        item
      );
    } else if (productInfo[index].expQty > 1) {
      setProductInfo((pre) => {
        pre[index] = { ...pre[index], expQty: pre[index].expQty - 1 };
        return [...pre];
      });
      return updateDataListProduct(
        productInfo[index].expQty - 1,
        item.o_13,
        item
      );
    } else {
      return updateDataListProduct(1, item.o_13, item);
    }
  };

  const handleChangePriceProductInvoice = (type, item, index, valuePrice) => {
    if (type === "change") {
      setProductInfo((pre) => {
        pre[index] = { ...pre[index], expPrice: valuePrice };
        return [...pre];
      });
      return updateDataListProduct(item.o_10, valuePrice, item);
    }else if (type === "increase") {
      setProductInfo((pre) => {
        pre[index] = { ...pre[index], expPrice: pre[index].expPrice + 1000 };
        return [...pre];
      });
      return updateDataListProduct(
        item.o_10,
        productInfo[index].expPrice + 1000,
        item
      );
    } else if (productInfo[index].expPrice > 1000) {
      setProductInfo((pre) => {
        pre[index] = { ...pre[index], expPrice: pre[index].expPrice - 1000 };
        return [...pre];
      });
      return updateDataListProduct(
        item.o_10,
        productInfo[index].expPrice - 1000,
        item
      );
    }
    return updateDataListProduct(item.o_10, 1, item);
    
  };

  return (
    <TableContainer className="table-list-product p-2">
      <Table
        className="h-100"
        stickyHeader
        style={{ border: "1px solid var(--gray3)", height: "100%" }}
      >
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
                  key={index}
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
            console.log(item);
            return (
              <TableRow hover role="checkbox" tabIndex={-1} key={index}>
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
                          <>
                          <TableCell
                                            align="center"
                                            nowrap="true"
                                          >
                                            <IconButtonCpn.IconButtonTrash
                                              onClick={() => {
                                                onRemove(item);
                                              }}
                                            />
                                          </TableCell>
                            {/* <TableCell align="center" nowrap="true">
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
                              </TableCell> */}
                          </>
                        );
                      case "o_4":
                        return (
                          <TableCell align="center" nowrap="true">
                            {item.o_4}
                          </TableCell>
                        );
                      case "o_10":
                        return (
                          <TableCell align="center" nowrap="true">
                            <div className="flex justify-content-center align-items-center">
                              <IC_ADD
                                className="cursor-pointer"
                                stroke="var(--gray2)"
                                onClick={() =>
                                  handleChangeQtyProductInvoice(
                                    "increase",
                                    item,
                                    index
                                  )
                                }
                              />
                              <input
                                onChange={(e) =>
                                  handleChangeQtyProductInvoice(
                                    "change",
                                    item,
                                    index,
                                    glb_sv.formatValue(e.target.value, "number")
                                  )
                                }
                                className="mr-1"
                                style={{
                                  border: "none",
                                  width: "30%",
                                  textAlign: "center",
                                  outline: "none",
                                }}
                                value={glb_sv.formatValue(
                                  productInfo[index]?.expQty || 1,
                                  "currency"
                                )}
                              />
                              <IC_REDUCED
                                className="cursor-pointer"
                                stroke="var(--gray2)"
                                onClick={() =>
                                  handleChangeQtyProductInvoice(
                                    "reduced",
                                    item,
                                    index
                                  )
                                }
                              />
                            </div>
                          </TableCell>
                        );

                      case "o_13":
                        return (
                          <TableCell align="center" nowrap="true">
                            {/* {isIndexRow === index ? (
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
                              )} */}
                            {item.o_3 === "1" ? (
                              <div className="flex justify-content-center align-items-center">
                                <IC_ADD
                                  className="cursor-pointer"
                                  stroke="var(--gray2)"
                                  onClick={() =>
                                    handleChangePriceProductInvoice(
                                      "increase",
                                      item,
                                      index
                                    )
                                  }
                                />
                                <input
                                  onChange={(e) =>
                                    handleChangePriceProductInvoice(
                                      "change",
                                      item,
                                      index,
                                      glb_sv.formatValue(
                                        e.target.value,
                                        "number"
                                      )
                                    )
                                  }
                                  className="mr-1 border-none text-center outline-none"
                                  style={{
                                    width: "30%",
                                  }}
                                  value={glb_sv.formatValue(
                                    productInfo[index]?.expPrice || 1,
                                    "currency"
                                  )}
                                />
                                <IC_REDUCED
                                  className="cursor-pointer"
                                  stroke="var(--gray2)"
                                  onClick={() =>
                                    handleChangePriceProductInvoice(
                                      "reduced",
                                      item,
                                      index
                                    )
                                  }
                                />
                              </div>
                            ) : (
                              glb_sv.formatValue(item.o_13, col["type"])
                            )}
                          </TableCell>
                        );

                      case "o_14":
                        return (
                          <TableCell align="center" nowrap="true">
                            {/* {isIndexRow === index ? (
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
                              )} */}
                          </TableCell>
                        );
                      case "o_15":
                        return (
                          <TableCell
                            align="center"
                            nowrap="true"
                            style={{ minWidth: "100px" }}
                          >
                            {/* {isIndexRow === index ? (
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
                              )} */}
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
  );
};

export default ListProductImport;
