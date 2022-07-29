import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@material-ui/core";
import LoopIcon from "@material-ui/icons/Loop";
import SaveIcon from "@material-ui/icons/Save";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import DeleteIcon from "@material-ui/icons/Delete";
import { ReactComponent as IC_SHAPE } from "../../asset/images/shape.svg";
import { defaults } from "lodash";
import "./style.css";

const ButtonUpdate = (props) => {
  const {
    className = "",
    onClick,
    disabled = false,
    process,
    title = "Cập nhập (F3)",
  } = props;
  return (
    <Button
      size="medium"
      className={`btn-update-delete-cpn ${
        disabled ? "gray3-bg" : "primary-bg text-white"
      } ${className}`}
      variant="contained"
      onClick={onClick}
      disabled={disabled || process}
    >
      {process ? (
        <LoopIcon className="button-loading" />
      ) : (
        <SaveIcon className="" />
      )}
      &nbsp;{title}
    </Button>
  );
};

const ButtonClose = (props) => {
  const { onClick = () => {}, process = false } = props;
  return (
    <button
      disabled={process}
      className="fz14 btn-custom text-uppercase"
      onClick={onClick}
    >
      <ExitToAppIcon /> &nbsp;Đóng (ESC)
    </button>
  );
};

const ButtonDelete = (props) => {
  const { className = "", onClick, process = false } = props;
  return (
    <Button
      size="medium"
      className={`btn-update-delete-cpn ${
        process ? "gray3-bg text-white" : "orange-bg text-white"
      } ${className}`}
      variant="contained"
      onClick={onClick}
      disabled={process}
    >
      {process ? (
        <LoopIcon className="button-loading" />
      ) : (
        <DeleteIcon className="" />
      )}
      &nbsp;Xóa (F10)
    </Button>
  );
};

const ButtonGetMoreData = (props) => {
  const { t } = useTranslation();
  const {
    disabled = false,
    totalRecords = 0,
    displayRecords = 0,
    onClick = () => {},
  } = props;
  return (
    <>
      Hiển thị {displayRecords + "/" + totalRecords + " " + t("rowData")}
      <button
        onClick={onClick}
        disabled={disabled}
        className="btn-custom ml-3 mr-2"
        style={{
          background: displayRecords >= totalRecords && "var(--gray3)",
        }}
      >
        <IC_SHAPE className="pr-1" /> Lấy thêm dữ liệu{" "}
      </button>
    </>
  );
};

export { ButtonUpdate, ButtonDelete, ButtonClose, ButtonGetMoreData };