import React, { useState } from "react";
import "./style.css";
import {
  Card,
  CardHeader,
  CardContent,
  Grid,
  Accordion,
  AccordionSummary,
  Typography,
  AccordionDetails,
  Button,
  TextareaAutosize,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Breadcrumb from "../../../components/Breadcrumb/View";

import { ReactComponent as IC_VECTOR } from "../../../asset/images/vector.svg";
import { ReactComponent as IC_ADD } from "../../../asset/images/add.svg";
import { ReactComponent as IC_LIST } from "../../../asset/images/list.svg";
import {
  CheckBoxCpn,
  TitleFilterCpn,
  TextFieldCpn,
  AutocompleteCpn,
  AccordionCpn,
  TextAreaCpn,
  // TitleFilter,
} from "../../../basicComponents";
import { useHistory } from "react-router-dom";

const ProductAdd = () => {
  let history = useHistory();
  const [expanded, setExpanded] = useState("expanded1");

  const handExpanded = (expan) => {
    setExpanded((pre) => (pre === expan ? "" : expan));
  };

  const showBorder = (e) => {
    return e === expanded ? "1px solid var(--gray3)" : "";
  };
  return (
    <div className="p-2">
      <div className="product-add-header">
        <div className="pl-2">
          <Breadcrumb />
          <div className="mt-2 text-black">
            Đây là trang giúp bạn khai báo một sản phẩm mới nhập hoặc ngày đầu
            áp dụng kiểm kê hàng tồn
          </div>
        </div>
        <div className="flex">
          <Button
            style={{ height: "40px" }}
            size="medium"
            className="primary-bg text-white"
            variant="contained"
            onClick={() => {
              history.push({
                pathname: "/page/products/add-product",
              });
            }}
          >
            <IC_ADD className="pr-1" />
            <div>Lưu</div>
          </Button>
          <button className="btn-custom ml-2 mr-2">
            <IC_VECTOR className="pr-1" />
            <div>Lưu và thêm mới</div>
          </button>
        </div>
      </div>
      <div className="product-add-content p-3">
        <Grid className="mt-2" container spacing={1}>
          <Grid item xs={12} sm={6} md>
            <TextFieldCpn label="Mã sản phẩm" className="mb-3 " />
          </Grid>
          <Grid item xs={12} sm={6} md>
            <TextFieldCpn label="Tên sản phẩm" className="mb-3 " />
          </Grid>
          <Grid item xs={12} sm={6} md>
            <AutocompleteCpn className="" label="Nhóm sản phẩm" />
          </Grid>
          <Grid item xs={12} sm={6} md>
            <TextFieldCpn label="Đơn vị nhỏ nhất" className="mb-3 " />
          </Grid>
          <Grid item xs={12} sm={6} md>
            <TextFieldCpn label="Mã vạch" className="mb-3" />
          </Grid>
        </Grid>
        <Grid className="mt-1" container spacing={1}>
          <Grid item xs={12} sm={6} md>
            <TextFieldCpn label="Số lượng tồn kho" className="mb-3 " />
          </Grid>
          <Grid item xs={12} sm={6} md>
            <TextFieldCpn label="Số lô" className="mb-3 " />
          </Grid>
          <Grid item xs={12} sm={6} md>
            <AutocompleteCpn className="" label="Ngày hết hạn sử dụng" />
          </Grid>
          <Grid item xs={12} sm={6} md>
            <TextFieldCpn label="Đơn vị nhỏ nhất" className="mb-3 " />
          </Grid>
          <Grid item xs={12} sm={6} md>
            <TextFieldCpn label="Giá vốn" className="mb-3" />
          </Grid>
        </Grid>
        <div className="form-handling-stock-limit w-100">
          <AccordionCpn
            onClick={() => {
              handExpanded("expanded1");
            }}
            expanded={"expanded1" === expanded}
            styleHeader={{ borderBottom: showBorder("expanded1") }}
            labelHeader="Đơn vị tính khác"
            content={
              <Grid className="mt-2" container spacing={1}>
                <Grid item xs={12} sm={6} md>
                  <TextFieldCpn label="Đơn vị" className="mb-3" />
                </Grid>
                <Grid item xs={12} sm={6} md>
                  <TextFieldCpn
                    label="SL quy đổi ra đv nhỏ nhất (*)"
                    className="mb-3"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md>
                  <AutocompleteCpn label="Đơn vị nhỏ nhất" className="mb-3" />
                </Grid>
              </Grid>
            }
          />
        </div>
        <div className="form-handling-stock-limit w-100">
          <AccordionCpn
            onClick={() => {
              handExpanded("expanded2");
            }}
            expanded={"expanded2" === expanded}
            styleHeader={{ borderBottom: showBorder("expanded2") }}
            labelHeader="Hạn mức kho và giá bán"
            content={
              <Grid className="mt-1" container spacing={1}>
                <Grid item xs={12} sm={6} md>
                  <TextFieldCpn
                    label="Hạn mức kho tối thiểu"
                    className="mb-3 "
                  />
                </Grid>
                <Grid item xs={12} sm={6} md>
                  <TextFieldCpn label="Hạn mức kho tối đa" className="mb-3 " />
                </Grid>
                <Grid item xs={12} sm={6} md>
                  <AutocompleteCpn label="Đơn vị nhỏ nhất" className="mb-3" />
                </Grid>
                <Grid item xs={12} sm={6} md>
                  <TextFieldCpn label="Giá nhập" className="mb-3 " />
                </Grid>
                <Grid item xs={12} sm={6} md>
                  <TextFieldCpn label="Giá bán lẻ" className="mb-3" />
                </Grid>
                <Grid item xs={12} sm={6} md>
                  <TextFieldCpn label="Giá bán sĩ" className="mb-3" />
                </Grid>
              </Grid>
            }
          />
        </div>

        <div className="form-handling-extend w-100">
          <AccordionCpn
            onClick={() => {
              handExpanded("expanded3");
            }}
            expanded={"expanded3" === expanded}
            styleHeader={{
              borderBottom: showBorder("expanded3"),
            }}
            labelHeader="Thông tin mở rộng"
            content={
              <div className="w-100 mt-1">
                <Grid container spacing={1}>
                  <Grid item xs={12} sm={6} md>
                    <TextAreaCpn
                      className="w-100 mb-3"
                      label="Bào chế đóng gói"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md>
                    <TextAreaCpn className="w-100 mb-3" label="Thành phần" />
                  </Grid>
                  <Grid item xs={12} sm={6} md>
                    <TextAreaCpn className="w-100 mb-3" label="Chỉ định" />
                  </Grid>
                  <Grid item xs={12} sm={6} md>
                    <TextAreaCpn
                      className="w-100 mb-3"
                      label="Chống chỉ định"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md>
                    <TextAreaCpn
                      className="w-100 mb-3"
                      label="Liều lượng cách dùng"
                    />
                  </Grid>
                </Grid>
                <Grid container spacing={1}>
                  <Grid item xs={12} sm={6} md>
                    <TextAreaCpn className="w-100 mb-3" label="Xuất sứ" />
                  </Grid>
                  <Grid item xs={12} sm={6} md>
                    <TextAreaCpn
                      className="w-100 mb-3"
                      label="Tương tác thuốc"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md>
                    <TextAreaCpn
                      className="w-100 mb-3"
                      label="Điều kiện bảo quản"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md>
                    <TextAreaCpn className="w-100 mb-3" label="Tác dụng phụ" />
                  </Grid>
                  <Grid item xs={12} sm={6} md>
                    <TextAreaCpn
                      className="w-100 mb-3"
                      label="Quá liều và cách xử lí"
                    />
                  </Grid>
                </Grid>
              </div>
            }
          />
        </div>

        <div className="form-handling-inventory w-100">
          <AccordionCpn
            onClick={() => {
              handExpanded("expanded4");
            }}
            expanded={"expanded4" === expanded}
            styleHeader={{ borderBottom: showBorder("expanded4") }}
            labelHeader="Hình ảnh"
            content={
              <div className="flex justify-content-between w-100">Hình ảnh</div>
            }
          />
        </div>
      </div>
    </div>
  );
};

export default ProductAdd;
