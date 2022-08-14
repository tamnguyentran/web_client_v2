import React from "react";
import "./style.css";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";

const WrapperFilter = (props) => {
  const { children, isShowLayout = false, style = {} } = props;
  return (
    <div style={style} className={`wrapper-filter ${isShowLayout && "dl-none"}`}>
      {children}
    </div>
  );
};

const stylesIcon = { margin: "3px", color: "var(--white)" };

const WrapperTable = (props) => {
  const { children, isShowLayout = false, setIsShowLayout, hiddenIcon = false, style = {} } = props;
  return (
    <div style={style} className={`wrapper-table ${isShowLayout && "w-100"}`}>
      <div
        className={`btn-show-layout ${hiddenIcon && "dl-none "}`}
        onClick={() => {
          setIsShowLayout((pre) => !pre);
        }}
      >
        {isShowLayout ? (
          <ChevronRightIcon style={stylesIcon} />
        ) : (
          <ChevronLeftIcon style={stylesIcon} />
        )}
      </div>
      {children}
    </div>
  );
};

const WrapperHeader = (props) => {
  const { children } = props;
  return <div className="wrapper-header">{children}</div>;
};
const WrapperContent = (props) => {
  const { children } = props;
  return <div className="wrapper-content p-3">{children}</div>;
};
const WrapperFooter = (props) => {
  const { children } = props;
  return <div className="wrapper-footer p-3">{children}</div>;
};

export {
  WrapperFilter,
  WrapperTable,
  WrapperHeader,
  WrapperContent,
  WrapperFooter,
};
