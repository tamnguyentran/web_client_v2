import React from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Dialog,
  Button,
} from "@material-ui/core";
import { ButtonCpn } from "../../../basicComponents";

const UnitRemove = (props) => {
  const {
    name = "",
    shouldOpenRemoveModal,
    setShouldOpenRemoveModal,
    processing = false,
    handleDelete,
  } = props;
  return (
    <Dialog
      maxWidth="xs"
      fullWidth={true}
      TransitionProps={{
        addEndListener: (node, done) => {
          node.addEventListener("keypress", function (e) {
            if (e.key === "Enter") {
              handleDelete();
            }
          });
        },
      }}
      open={shouldOpenRemoveModal}
      onClose={() => {
        if (processing) return;
        setShouldOpenRemoveModal(false);
      }}
    >
      <Card>
        <CardHeader className="card-header" title={"Xác nhận xóa đơn vị ?"} />
        <CardContent>{name}</CardContent>
        <CardActions className="align-items-center justify-content-end">
          <ButtonCpn.ButtonClose
            process={processing}
            onClick={() => {
              setShouldOpenRemoveModal(false);
            }}
          />
          <ButtonCpn.ButtonDelete
            onClick={handleDelete}
            disabled={processing}
            process={processing}
          />
        </CardActions>
      </Card>
    </Dialog>
  );
};

export default UnitRemove;
