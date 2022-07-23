import React from "react";
import { IconButton } from "@material-ui/core";
import { ReactComponent as IC_TRASH } from "../../asset/images/trash.svg";
import { ReactComponent as IC_EDIT } from "../../asset/images/edit.svg";
import { ReactComponent as IC_UNLOCK } from "../../asset/images/unlock.svg";
import { ReactComponent as IC_LOCK } from "../../asset/images/lock.svg";
const IconButtonEdit = (props) => {
  const { onClick = () => {} } = props;
  return (
    <IconButton className="mr-2 p-2 green3-bg" onClick={onClick}>
      <IC_EDIT />
    </IconButton>
  );
};

const IconButtonTrash = (props) => {
  const { onClick = () => {} } = props;
  return (
    <IconButton className="mr-2 p-2 orange-bg" onClick={onClick}>
      <IC_TRASH />
    </IconButton>
  );
};

const IconButtonLock = (props) => {
  const { checkLock, onClick = () => {} } = props;
  return (
    <IconButton
      className={`mr-2 p-2 ${checkLock ? "green3-bg" : "red-bg"}`}
      onClick={onClick}
    >
      {checkLock ? <IC_UNLOCK /> : <IC_LOCK />}
    </IconButton>
  );
};

export { IconButtonEdit, IconButtonTrash, IconButtonLock };
