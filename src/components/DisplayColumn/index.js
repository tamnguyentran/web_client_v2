import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Drawer,
} from "@material-ui/core";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import { ReactComponent as IC_LIST } from "../../asset/images/list.svg";

const DisplayColumn = ({
  columns,
  handleCheckChange,
  style = { backgroundColor: "#fff" },
}) => {
  const { t } = useTranslation();
  const [shouldOpenDisplay, setShouldOpenDisplay] = useState(false);

  const onClickColumn = (e) => {
    setShouldOpenDisplay(true);
  };

  const onCloseColumn = () => {
    setShouldOpenDisplay(false);
  };

  return (
    <React.Fragment key="display-column">
      <button className="btn-custom" onClick={onClickColumn}>
        <IC_LIST />
      </button>
      <Drawer anchor="right" open={shouldOpenDisplay} onClose={onCloseColumn}>
        <List>
          {columns.map((item, index) => {
            return (
              <ListItem
                key={index}
                role={undefined}
                dense
                button
                onClick={(e) => null}
              >
                <ListItemText
                  id={item.title}
                  primary={t(item.title)}
                  onClick={(e) => handleCheckChange(item)}
                />
                <ListItemIcon className="customMenuList">
                  <Checkbox
                    className={!item.disabled && "text-green2"}
                    edge="end"
                    checked={item.show}
                    disabled={item.disabled}
                    onChange={() => handleCheckChange(item)}
                    inputProps={{ "aria-labelledby": item.title }}
                  />
                </ListItemIcon>
              </ListItem>
            );
          })}
        </List>
      </Drawer>
    </React.Fragment>
  );
};

export default DisplayColumn;
