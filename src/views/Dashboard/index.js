import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import moment from "moment";
import {
  Card,
  CardHeader,
  CardContent,
  Grid,
  Select,
  MenuItem,
  Paper,
} from "@material-ui/core";

import glb_sv from "../../utils/service/global_service";
import control_sv from "../../utils/service/control_services";
import SnackBarService from "../../utils/service/snackbar_service";
import reqFunction from "../../utils/constan/functions";
import sendRequest from "../../utils/service/sendReq";
import { formatCurrency } from "../../components/Bill/initPharmacyInfo.modal";

// import { ReactComponent as IC_MONEY } from "../../asset/images/dashboard-money.svg";
// import { ReactComponent as IC_RETURN } from "../../asset/images/dashboard-return.svg";
// import { ReactComponent as IC_DESTROY } from "../../asset/images/dashboard-destroy.svg";
// import { ReactComponent as IC_IMPORT } from "../../asset/images/dashboard-import.svg";

import { styled } from "@material-ui/styles";

import DashboardChart from "./DashboardChart";
import ProductGroup_Autocomplete from "../Products/ProductGroup/Control/ProductGroup.Autocomplete";

const serviceInfo = {
  REPORT_STATIC: {
    functionName: "rp_static",
    reqFunct: reqFunction.REPORT_STATIC,
    biz: "report",
    object: "rp_statistic",
  },
  REPORT_STATIC_CHART: {
    functionName: "rpexp_static",
    reqFunct: reqFunction.REPORT_STATIC_CHART,
    biz: "report",
    object: "rp_statistic",
  },
};

const DashboardLayout = () => {
    const reff = useRef(0)
  const { t } = useTranslation();
  const [dataReportStaticDay, setDataReportStaticDay] = useState({});
  const [dataReportStaticWeek, setDataReportStaticWeek] = useState({});
  const [dataReportStaticMonth, setDataReportStaticMonth] = useState({});
  const [dataChart, setDataChart] = useState([]);
  const [typeChart, setTypeChart] = useState("1"); // '1' là tháng hiện tại - 2 tháng trước

  useEffect(() => {
    invoiceStatistics("1");
    invoiceStatistics("2");
    invoiceStatistics("3");
  }, []);

  useEffect(() => {
    sendRequest(
      serviceInfo.REPORT_STATIC_CHART,
      [typeChart],
      handleResultGetChartData,
      true,
      handleTimeOut
    );
  }, [typeChart]);

  const invoiceStatistics = (type) => {
    sendRequest(
      serviceInfo.REPORT_STATIC,
      [type],
      (reqInfoMap, message) => {
        handleResultGetReportStatic(reqInfoMap, message, type);
      },
      true,
      handleTimeOut
    );
  };

  const handleResultGetChartData = (reqInfoMap, message) => {
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
      let newData = message["PROC_DATA"];
      setDataChart(newData.rows);
    }
  };

  const handleResultGetReportStatic = (reqInfoMap, message, type) => {
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
      let newData = message["PROC_DATA"];
      switch (type) {
        case "1":
          setDataReportStaticDay(newData.rows[0]);
          break;
        case "2":
          setDataReportStaticWeek(newData.rows[0]);
          break;
        case "3":
          setDataReportStaticMonth(newData.rows[0]);
          break;
      }
    }
  };

  //-- xử lý khi timeout -> ko nhận được phản hồi từ server
  const handleTimeOut = (e) => {
    SnackBarService.alert(t(`message.${e.type}`), true, 4, 3000);
  };

  const handleChange = (event) => {
    setTypeChart(event.target.value);
  };

  const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme?.palette?.mode === "dark" ? "#1A2027" : "#fff",
    ...theme?.typography?.body2,
    color: theme?.palette?.text?.secondary,
  }));

  return (
    <>
      <Grid container spacing={2}>
        {/** Fake lấy id nhóm sp dược phẩm => check các điều kiện bắt buộc nhập exp date */}
        <div className="d-none">
          <ProductGroup_Autocomplete />
        </div>
        <Grid item xs={12} sm={12}>
          <Card className="mt-2">
            <CardHeader title={t("Thống kê tổng quát tình trạng kinh doanh")} />
            <CardContent>
              <Grid
                container
                spacing={2}
                columnSpacing={{ xs: 1, sm: 2, md: 3 }}
              >
                <Grid item xs={3}>
                  <Item>
                    <div className="content">
                      <div
                        style={{ color: "var(--blue)" }}
                        className="title-order"
                      >
                        {t("dashboard.export")} {t("dashboard.day")}
                      </div>
                      <div className="fz14">
                        {t("dashboard.invoice_value")} : {formatCurrency(dataReportStaticDay?.o_3)}{" "}
                        {t("currency")}
                      </div>
                      <div className="fz14">
                        {t("dashboard.invoice_count")} : {dataReportStaticDay?.o_4}{" "}
                        {t("dashboard.invoice")}
                      </div>
                    </div>
                  </Item>
                </Grid>
                <Grid item xs={3}>
                  <Item>
                    <div className="content">
                      <div
                        style={{ color: "var(--green)" }}
                        className="title-order"
                      >
                        {t("dashboard.import")} {t("dashboard.day")}
                      </div>
                      <div className="fz14">
                        {t("dashboard.invoice_value")} : {formatCurrency(dataReportStaticDay?.o_1)}{" "}
                        {t("currency")}
                      </div>
                      <div className="fz14">
                        {t("dashboard.invoice_count")} : {dataReportStaticDay?.o_2}{" "}
                        {t("dashboard.invoice")}
                      </div>
                    </div>
                  </Item>
                </Grid>
                <Grid item xs={3}>
                  <Item>
                    <div className="content">
                      <div
                        style={{ color: "var(--orange)" }}
                        className="title-order"
                      >
                        {t("dashboard.export_repay")} {t("dashboard.day")}
                      </div>
                      <div className="fz14">
                        {t("dashboard.invoice_value")} : {formatCurrency(dataReportStaticDay?.o_7)}{" "}
                        {t("currency")}
                      </div>
                      <div className="fz14">
                        {t("dashboard.invoice_count")} : {dataReportStaticDay?.o_8}{" "}
                        {t("dashboard.invoice")}
                      </div>
                    </div>
                  </Item>
                </Grid>
                <Grid item xs={3}>
                  <Item>
                    <div className="content">
                      <div
                        style={{ color: "var(--danger)" }}
                        className="title-order"
                      >
                        {t("dashboard.export_destroy")} {t("dashboard.day")}
                      </div>
                      <div className="fz14">
                        {t("dashboard.invoice_value")} : {formatCurrency(dataReportStaticDay?.o_5)}{" "}
                        {t("currency")}
                      </div>
                      <div className="fz14">
                        {t("dashboard.invoice_count")} : {dataReportStaticDay?.o_6}{" "}
                        {t("dashboard.invoice")}
                      </div>
                    </div>
                  </Item>
                </Grid>
              </Grid>

              <Grid
                container
                spacing={2}
                columnSpacing={{ xs: 1, sm: 2, md: 3 }}
              >
                <Grid item xs={3}>
                  <Item>
                    <div className="content">
                      <div
                        style={{ color: "var(--blue)" }}
                        className="title-order"
                      >
                        {t("dashboard.export")} {t("dashboard.week")}
                      </div>
                      <div className="fz14">
                        {t("dashboard.invoice_value")} : {formatCurrency(dataReportStaticWeek?.o_3)}{" "}
                        {t("currency")}
                      </div>
                      <div className="fz14">
                        {t("dashboard.invoice_count")} : {dataReportStaticWeek?.o_4}{" "}
                        {t("dashboard.invoice")}
                      </div>
                    </div>
                  </Item>
                </Grid>
                <Grid item xs={3}>
                  <Item>
                    <div className="content">
                      <div
                        style={{ color: "var(--green)" }}
                        className="title-order"
                      >
                        {t("dashboard.import")} {t("dashboard.week")}
                      </div>
                      <div className="fz14">
                        {t("dashboard.invoice_value")} : {formatCurrency(dataReportStaticWeek?.o_1)}{" "}
                        {t("currency")}
                      </div>
                      <div className="fz14">
                        {t("dashboard.invoice_count")} : {dataReportStaticWeek?.o_2}{" "}
                        {t("dashboard.invoice")}
                      </div>
                    </div>
                  </Item>
                </Grid>
                <Grid item xs={3}>
                  <Item>
                    <div className="content">
                      <div
                        style={{ color: "var(--orange)" }}
                        className="title-order"
                      >
                        {t("dashboard.export_repay")} {t("dashboard.week")}
                      </div>
                      <div className="fz14">
                        {t("dashboard.invoice_value")} : {formatCurrency(dataReportStaticWeek?.o_7)}{" "}
                        {t("currency")}
                      </div>
                      <div className="fz14">
                        {t("dashboard.invoice_count")} : {dataReportStaticWeek?.o_8}{" "}
                        {t("dashboard.invoice")}
                      </div>
                    </div>
                  </Item>
                </Grid>
                <Grid item xs={3}>
                  <Item>
                    <div className="content">
                      <div
                        style={{ color: "var(--danger)" }}
                        className="title-order"
                      >
                        {t("dashboard.export_destroy")} {t("dashboard.week")}
                      </div>
                      <div className="fz14">
                        {t("dashboard.invoice_value")} : {formatCurrency(dataReportStaticWeek?.o_5)}{" "}
                        {t("currency")}
                      </div>
                      <div className="fz14">
                        {t("dashboard.invoice_count")} : {dataReportStaticWeek?.o_6}{" "}
                        {t("dashboard.invoice")}
                      </div>
                    </div>
                  </Item>
                </Grid>
              </Grid>

              <Grid
                container
                spacing={2}
                columnSpacing={{ xs: 1, sm: 2, md: 3 }}
              >
                <Grid item xs={3}>
                  <Item>
                    <div className="content">
                      <div
                        style={{ color: "var(--blue)" }}
                        className="title-order"
                      >
                        {t("dashboard.export")} {t("dashboard.month")}
                      </div>
                      <div className="fz14">
                        {t("dashboard.invoice_value")} : {formatCurrency(dataReportStaticMonth?.o_3)}{" "}
                        {t("currency")}
                      </div>
                      <div className="fz14">
                        {t("dashboard.invoice_count")} : {dataReportStaticMonth?.o_4}{" "}
                        {t("dashboard.invoice")}
                      </div>
                    </div>
                  </Item>
                </Grid>
                <Grid item xs={3}>
                  <Item>
                    <div className="content">
                      <div
                        style={{ color: "var(--green)" }}
                        className="title-order"
                      >
                        {t("dashboard.import")} {t("dashboard.month")}
                      </div>
                      <div className="fz14">
                        {t("dashboard.invoice_value")} : {formatCurrency(dataReportStaticMonth?.o_1)}{" "}
                        {t("currency")}
                      </div>
                      <div className="fz14">
                        {t("dashboard.invoice_count")} : {dataReportStaticMonth?.o_2}{" "}
                        {t("dashboard.invoice")}
                      </div>
                    </div>
                  </Item>
                </Grid>
                <Grid item xs={3}>
                  <Item>
                    <div className="content">
                      <div
                        style={{ color: "var(--orange)" }}
                        className="title-order"
                      >
                        {t("dashboard.export_repay")} {t("dashboard.month")}
                      </div>
                      <div className="fz14">
                        {t("dashboard.invoice_value")} : {formatCurrency(dataReportStaticMonth?.o_7)}{" "}
                        {t("currency")}
                      </div>
                      <div className="fz14">
                        {t("dashboard.invoice_count")} : {dataReportStaticMonth?.o_8}{" "}
                        {t("dashboard.invoice")}
                      </div>
                    </div>
                  </Item>
                </Grid>
                <Grid item xs={3}>
                  <Item>
                    <div className="content">
                      <div
                        style={{ color: "var(--danger)" }}
                        className="title-order"
                      >
                        {t("dashboard.export_destroy")} {t("dashboard.month")}
                      </div>
                      <div className="fz14">
                        {t("dashboard.invoice_value")} : {formatCurrency(dataReportStaticMonth?.o_5)}{" "}
                        {t("currency")}
                      </div>
                      <div className="fz14">
                        {t("dashboard.invoice_count")} : {dataReportStaticMonth?.o_6}{" "}
                        {t("dashboard.invoice")}
                      </div>
                    </div>
                  </Item>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={12}>
          <Card>
            <CardHeader
              title={t("dashboard.revenue_chart")}
              action={
                <div>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={typeChart}
                    onChange={handleChange}
                    style={{ color: "#fff" }}
                  >
                    <MenuItem value={"1"}>
                      {" "}
                      {t("dashboard.current_month")}
                    </MenuItem>
                    <MenuItem value={"2"}>{t("dashboard.last_month")}</MenuItem>
                  </Select>
                </div>
              }
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={12}>
                  <DashboardChart data={dataChart} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
};

export default DashboardLayout;
