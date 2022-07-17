import React, { useState, useEffect, useRef } from "react";
import "./Menu1.css";
import { useTranslation } from "react-i18next";
import { ReactComponent as IC_DASHBOARD } from "../../asset/images/dashboard.svg";
import { ReactComponent as IC_PRODUCT } from "../../asset/images/product.svg";
import { ReactComponent as IC_PRODUCT_GROUP } from "../../asset/images/product-group.svg";
import { ReactComponent as IC_IMPORT } from "../../asset/images/import.svg";
import { ReactComponent as IC_IMPORT_INVENTORY } from "../../asset/images/import-inventory.svg";
import { ReactComponent as IC_EXPORT } from "../../asset/images/export.svg";
import { ReactComponent as IC_EXPORT_REPAY } from "../../asset/images/export-repay.svg";
import { ReactComponent as IC_EXPORT_DESTROY } from "../../asset/images/export-destroy.svg";
import { ReactComponent as IC_ORDER } from "../../asset/images/order.svg";
import { ReactComponent as IC_PARTNER } from "../../asset/images/partner.svg";
import { ReactComponent as IC_CUSTOMER } from "../../asset/images/customer.svg";
import { ReactComponent as IC_SUPPLIER } from "../../asset/images/supplier.svg";
import { ReactComponent as IC_SETTLEMENT } from "../../asset/images/settlement.svg";
import { ReactComponent as IC_SETT_IMPORT } from "../../asset/images/sett-import.svg";
import { ReactComponent as IC_SETT_EXPORT_REPAY } from "../../asset/images/sett-export-repay.svg";
import { ReactComponent as IC_REPORT } from "../../asset/images/report.svg";
import { ReactComponent as IC_REPORT_IMPORT } from "../../asset/images/report-import.svg";
import { ReactComponent as IC_REPORT_IMPORT_INVENTORY } from "../../asset/images/report-import-inventory.svg";
import { ReactComponent as IC_REPORT_EXPORT } from "../../asset/images/report-export.svg";
import { ReactComponent as IC_REPORT_EXPORT_REPAY } from "../../asset/images/report-export-repay.svg";
import { ReactComponent as IC_REPORT_EXPORT_DESTROY } from "../../asset/images/report-export-destroy.svg";
import { ReactComponent as IC_REPORT_IMPORT_PAYMENT } from "../../asset/images/report-import-payment.svg";
import { ReactComponent as IC_REPORT_COLLECT_MONEY } from "../../asset/images/report-collect-money.svg";
import { ReactComponent as IC_REPORT_TRANSACTION } from "../../asset/images/report-transaction.svg";
import { ReactComponent as IC_CONFIG } from "../../asset/images/config.svg";
import { ReactComponent as IC_UNIT } from "../../asset/images/unit.svg";
import { ReactComponent as IC_UNIT_RATE } from "../../asset/images/unit-rate.svg";
import { ReactComponent as IC_STORE_LIMIT } from "../../asset/images/store-limit.svg";
import { ReactComponent as IC_PRICE } from "../../asset/images/price.svg";
import { ReactComponent as IC_WARN_TIME } from "../../asset/images/warn-time.svg";
import { ReactComponent as IC_MANAGEMENT } from "../../asset/images/management.svg";
import { ReactComponent as IC_SETTING_PHARMACY } from "../../asset/images/setting-pharmacy.svg";
import { ReactComponent as IC_SETTING_USER } from "../../asset/images/setting-user.svg";
import { ReactComponent as IC_SETTING_PERMISSION } from "../../asset/images/setting-permission.svg";
import { ReactComponent as IC_SETTING_LOCK_ORDER } from "../../asset/images/setting-lock-order.svg";
import LocalShippingIcon from "@material-ui/icons/LocalShipping";
import { Link } from "react-router-dom";

const menuList = [
  {
    title: "menu.dashboard",
    icon: <IC_DASHBOARD />,
    link: "dashboard",
    key: "dashboard",
    children: [],
  },
  {
    title: "menu.manage_product",
    icon: <IC_PRODUCT />,
    link: "products/product",
    key: "products",
    children: [
      {
        title: "menu.product",
        icon: <IC_PRODUCT />,
        link: "products/product",
        key: "product",
      },
      {
        title: "menu.productGroup",
        icon: <IC_PRODUCT_GROUP />,
        link: "products/product-group",
        key: "productGroup",
      },
      {
        title: "Thêm sản phẩm",
        icon: <IC_PRODUCT_GROUP />,
        link: "products/add-product",
        key: "productAdd",
      },
    ],
  },
  {
    title: "menu.order",
    icon: <IC_ORDER />,
    link: "order",
    key: "order",
    children: [
      {
        title: "menu.importOrder",
        icon: <IC_IMPORT />,
        link: "order/ins-import",
        key: "ins-importOrder",
        hidden: true,
      },
      {
        title: "menu.importOrder",
        icon: <IC_IMPORT />,
        link: "order/edit-import",
        key: "edit-importOrder",
        hidden: true,
      },
      {
        title: "menu.importinven",
        icon: <IC_IMPORT />,
        link: "order/ins-importInventory",
        key: "ins-importInventoryOrder",
        hidden: true,
      },
      {
        title: "menu.importinven",
        icon: <IC_IMPORT />,
        link: "order/edit-importInventory",
        key: "edit-importInventoryOrder",
        hidden: true,
      },
      {
        title: "menu.exportOrder",
        icon: <IC_IMPORT />,
        link: "order/ins-export",
        key: "ins-exportInventoryOrder",
        hidden: true,
      },
      {
        title: "menu.exportOrder",
        icon: <IC_IMPORT />,
        link: "order/ins-exportt",
        key: "ins-exportInventoryOrder",
        hidden: true,
      },
      {
        title: "menu.exportOrder",
        icon: <IC_IMPORT />,
        link: "order/edit-export",
        key: "edit-exportOrder",
        hidden: true,
      },
      {
        title: "menu.exportRepay",
        icon: <IC_IMPORT />,
        link: "order/ins-exportRepay",
        key: "ins-exportRepayInventoryOrder",
        hidden: true,
      },
      {
        title: "menu.exportRepay",
        icon: <IC_IMPORT />,
        link: "order/edit-exportRepay",
        key: "edit-exportRepayOrder",
        hidden: true,
      },
      {
        title: "menu.exportDestroy",
        icon: <IC_IMPORT />,
        link: "order/ins-exportDestroy",
        key: "ins-exportDestroyInventoryOrder",
        hidden: true,
      },
      {
        title: "menu.exportDestroy",
        icon: <IC_IMPORT />,
        link: "order/edit-exportDestroy",
        key: "edit-exportDestroyInventoryOrder",
        hidden: true,
      },
      {
        title: "menu.importOrder",
        icon: <IC_IMPORT />,
        link: "order/import",
        key: "importOrder",
      },
      {
        title: "menu.importinven",
        icon: <IC_IMPORT_INVENTORY />,
        link: "order/import-inventory",
        key: "importinventory",
      },
      {
        title: "menu.exportOrder",
        icon: <IC_EXPORT />,
        link: "order/export",
        key: "exportOrder",
      },
      {
        title: "menu.exportRepay",
        icon: <IC_EXPORT_REPAY />,
        link: "order/export-repay",
        key: "exportRepay",
      },
      {
        title: "menu.exportDestroy",
        icon: <IC_EXPORT_DESTROY />,
        link: "order/export-destroy",
        key: "exportDestroy",
      },
    ],
  },
  {
    title: "menu.partner",
    icon: <IC_PARTNER />,
    link: "partner",
    key: "partner",
    children: [
      {
        title: "menu.customer",
        icon: <IC_CUSTOMER />,
        link: "partner/customer",
        key: "customer",
      },
      {
        title: "menu.supplier",
        icon: <IC_SUPPLIER />,
        link: "partner/supplier",
        key: "supplier",
      },
    ],
  },
  {
    title: "menu.settlement",
    icon: <IC_SETTLEMENT />,
    link: "settlement",
    key: "settlement",
    children: [
      {
        title: "menu.settlImp",
        icon: <IC_SETT_IMPORT />,
        link: "settlement/import",
        key: "settlImp",
      },
      {
        title: "menu.settlExp",
        icon: <IC_CUSTOMER />,
        link: "settlement/export",
        key: "settlExp",
      },
      {
        title: "menu.settlExpRepay",
        icon: <IC_SETT_EXPORT_REPAY />,
        link: "settlement/repay",
        key: "settlExpRepay",
      },
    ],
  },
  {
    title: "menu.report",
    icon: <IC_REPORT />,
    link: "report",
    key: "report",
    children: [
      {
        title: "menu.reportImportOrder",
        icon: <IC_REPORT_IMPORT />,
        link: "report/import",
        key: "reportImportOrder",
      },
      {
        title: "menu.reportImportInven",
        icon: <IC_REPORT_IMPORT_INVENTORY />,
        link: "report/import-inventory",
        key: "reportImportInven",
      },
      {
        title: "menu.reportExportOrder",
        icon: <IC_REPORT_EXPORT />,
        link: "report/export",
        key: "reportExportOrder",
      },
      {
        title: "menu.reportExportRepay",
        icon: <IC_REPORT_EXPORT_REPAY />,
        link: "report/export-repay",
        key: "reportExportRepay",
      },
      {
        title: "menu.reportExportDestroy",
        icon: <IC_REPORT_EXPORT_DESTROY />,
        link: "report/export-destroy",
        key: "reportExportDestroy",
      },
      {
        title: "import_payment",
        icon: <IC_REPORT_IMPORT_PAYMENT />,
        link: "report/import-payment",
        key: "reportImportPayment",
      },
      {
        title: "collecting_sales",
        icon: <IC_REPORT_COLLECT_MONEY />,
        link: "report/collect-sales",
        key: "reportCollectSales",
      },
      {
        title: "collecting_import_repay",
        icon: <IC_REPORT_COLLECT_MONEY />,
        link: "report/collect-returns",
        key: "reportCollectReturn",
      },
      {
        title: "menu.reportInventory",
        icon: <IC_IMPORT_INVENTORY />,
        link: "report/inventory",
        key: "reportInventory",
      },
      {
        title: "menu.reportTransactionStatement",
        icon: <IC_REPORT_TRANSACTION />,
        link: "report/transaction-statement",
        key: "reportTransactionStatement",
      },
    ],
  },
  {
    title: "menu.config",
    icon: <IC_CONFIG />,
    link: "config/unit",
    key: "config",
    children: [
      {
        title: "menu.configUnit",
        icon: <IC_UNIT />,
        link: "config/unit",
        key: "configUnit",
      },
      {
        title: "menu.configUnitRate",
        icon: <IC_UNIT_RATE />,
        link: "config/unit-rate",
        key: "configUnitRate",
      },
      {
        title: "menu.configStoreLimit",
        icon: <IC_STORE_LIMIT />,
        link: "config/store-limit",
        key: "configStoreLimit",
      },
      {
        title: "menu.configPrice",
        icon: <IC_PRICE />,
        link: "config/price",
        key: "configPrice",
      },
      {
        title: "menu.configWarn",
        icon: <IC_WARN_TIME />,
        link: "config/warn-time",
        key: "configWarn",
      },
    ],
  },
];

const menuAdmin = [
  {
    title: "menu.management",
    icon: <IC_MANAGEMENT />,
    link: "management/pharmacy",
    key: "management",
    children: [
      {
        title: "menu.setting-pharmacy",
        icon: <IC_SETTING_PHARMACY />,
        link: "management/pharmacy",
        key: "settingPharmacy",
      },
      {
        title: "menu.setting-user",
        icon: <IC_SETTING_USER />,
        link: "management/user",
        key: "settingUser",
      },
      {
        title: "menu.setting-permission",
        icon: <IC_SETTING_PERMISSION />,
        link: "management/permission",
        key: "settingPermission",
      },
      {
        title: "menu.setting-lock-order",
        icon: <IC_SETTING_LOCK_ORDER />,
        link: "management/lock-order",
        key: "settingLockOrder",
      },
      {
        title: "menu.setting-user",
        icon: <IC_SETTING_USER />,
        link: "management/user-info",
        key: "settingUserInfo",
        hidden: true,
      },
    ],
  },
];
const baseLink = "/page/";
const MenuView1 = () => {
  const { t } = useTranslation();
  return (
    <div className="menu-navbar flex justify-content-between aligh-item-center">
      <div>
        <ListMenu infoMenu={menuList} />
        <ListMenu infoMenu={menuAdmin} />
      </div>
      <div className="menu-import-export flex aligh-item-center">
        <div>
          <a href="/page/order/ins-import" className="menu-import">
            <IC_IMPORT />
            &emsp;Nhập hàng
          </a>
        </div>
        <div>
          <a href="/page/order/ins-exportt" className="menu-export">
            <LocalShippingIcon />
            &emsp;Xuất hàng
          </a>
        </div>
      </div>
    </div>
  );
};

export { MenuView1, menuList, menuAdmin };

export default function ListMenu(props) {
  const { infoMenu = [] } = props;
  const { t } = useTranslation();
  return infoMenu.map((item) => {
    return item?.children?.length ? (
      <div key={item.key} className="menu-dropdown">
        <button className="menu-dropbtn">
          {item.icon}&emsp;{t(item.title)}
        </button>
        <div className="menu-dropdown-content">
          {item.children
            .filter((x) => !x?.hidden)
            .map((subItem, index) => {
              return (
                <Link key={subItem.key} to={baseLink + subItem.link}>
                  {subItem.icon}&emsp;{t(subItem.title)}
                </Link>
              );
            })}
        </div>
      </div>
    ) : (
      <Link to={baseLink + item.link} key={item.key}>
        {item.icon}&emsp;{t(item.title)}
      </Link>
    );
  });
}
