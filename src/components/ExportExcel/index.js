import React from "react";
import { CSVLink } from "react-csv";
import { useTranslation } from "react-i18next";
import { Tooltip, Chip } from "@material-ui/core";
import * as XLSX from "xlsx";
// import { ReactComponent as IC_EXCEL } from '../../asset/images/excel.svg'
import GetAppIcon from "@material-ui/icons/GetApp";
import { ReactComponent as IC_VECTOR } from "../../asset/images/vector.svg";
import { ExportSheet } from "react-xlsx-sheet";

const ExportExcel = ({
  filename = "",
  data = [],
  headers = [],
  styleSvg = {},
  ...props
}) => {
  headers.forEach((item) => {
    item["title"] = item["label"];
    item["dataIndex"] = item["key"];
    delete item["label"];
    delete item["key"];
  });
  const { t } = useTranslation();

  return (
    <ExportSheet
      fileName={filename}
      dataSource={data}
      header={headers}
      xlsx={XLSX}
      isRequiredNameDate={false}
    >
      <button className="btn-custom">
        <IC_VECTOR className="pr-1" />
        <div>Xuất ra Excel</div>
      </button>
    </ExportSheet>
  );
};

export default ExportExcel;
